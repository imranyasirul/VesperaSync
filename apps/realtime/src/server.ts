import http from "http";
import { URL } from "url";
import { WebSocketServer, WebSocket, RawData } from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import Redis from "ioredis";
import { jwtVerify } from "jose";
import { prisma } from "@covalent/database";
import "dotenv/config";

const PORT = Number(process.env.REALTIME_PORT || 4000);
const INSTANCE_ID = `node-${Math.random().toString(36).slice(2, 10)}`;
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vesperasync_super_secret_jwt_key_2026"
);
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// বাইনারি ফ্রেম মেসেজ টাইপ
const MSG_SYNC = 0;
const MSG_AWARENESS = 1;

interface AuthUser {
  userId: string;
  email: string;
  name: string;
  cursorColor: string;
}

interface AuthenticatedSocket extends WebSocket {
  user: AuthUser;
  docId: string;
  role: string;
  isAlive: boolean;
  controlledIds: Set<number>;
}

interface DocumentRoom {
  docId: string;
  ydoc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  conns: Set<AuthenticatedSocket>;
  persistTimer: NodeJS.Timeout | null;
}

const rooms = new Map<string, DocumentRoom>();

// Redis Pub/Sub ও স্টেট ক্যাশ ক্লায়েন্ট
const pubClient = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 2 });
const subClient = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 2 });
let redisConnected = false;

pubClient.on("error", (err) => {
  if (redisConnected) console.warn("[Redis Pub] Warning:", err.message);
});
subClient.on("error", (err) => {
  if (redisConnected) console.warn("[Redis Sub] Warning:", err.message);
});

async function initRedis() {
  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    redisConnected = true;
    console.log(`[VesperaSync Realtime] Redis Pub/Sub connected (${INSTANCE_ID})`);

    subClient.on("messageBuffer", (channelBuf: Buffer, messageBuf: Buffer) => {
      const channel = channelBuf.toString("utf8");
      if (!channel.startsWith("vesperasync:room:")) return;

      const docId = channel.replace("vesperasync:room:", "");
      const room = rooms.get(docId);
      if (!room) return;

      // মেসেজ ফরম্যাট: [instanceIdLength (1 byte)][instanceId bytes][binary yjs payload]
      const senderLen = messageBuf[0];
      const senderId = messageBuf.subarray(1, 1 + senderLen).toString("utf8");
      if (senderId === INSTANCE_ID) return;

      const payload = new Uint8Array(messageBuf.subarray(1 + senderLen));
      const decoder = decoding.createDecoder(payload);
      const msgType = decoding.readVarUint(decoder);

      if (msgType === MSG_SYNC) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MSG_SYNC);
        syncProtocol.readSyncMessage(decoder, encoder, room.ydoc, "redis");
      } else if (msgType === MSG_AWARENESS) {
        const update = decoding.readVarUint8Array(decoder);
        awarenessProtocol.applyAwarenessUpdate(room.awareness, update, "redis");
      }
    });
  } catch {
    redisConnected = false;
    console.warn("[VesperaSync Realtime] Running in single-node memory mode (Redis offline)");
  }
}

function publishToRedis(docId: string, binaryPayload: Uint8Array) {
  if (!redisConnected) return;
  const idBytes = Buffer.from(INSTANCE_ID, "utf8");
  const packet = Buffer.concat([
    Buffer.from([idBytes.length]),
    idBytes,
    Buffer.from(binaryPayload),
  ]);
  pubClient.publish(`vesperasync:room:${docId}`, packet).catch(() => {});
}

function broadcastToRoom(room: DocumentRoom, data: Uint8Array, exclude?: AuthenticatedSocket) {
  for (const client of room.conns) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

async function persistRoomState(room: DocumentRoom) {
  try {
    const fullState = Y.encodeStateAsUpdate(room.ydoc);
    if (redisConnected) {
      await pubClient.set(
        `vesperasync:doc:${room.docId}:state`,
        Buffer.from(fullState).toString("base64")
      );
    }
    await prisma.document.update({
      where: { id: room.docId },
      data: { version: { increment: 1 } },
    });
  } catch (err) {
    console.error(`[Persist Error] doc=${room.docId}:`, err);
  }
}

function schedulePersist(room: DocumentRoom) {
  if (room.persistTimer) clearTimeout(room.persistTimer);
  room.persistTimer = setTimeout(() => {
    persistRoomState(room);
  }, 3000);
}

async function getOrCreateRoom(docId: string): Promise<DocumentRoom> {
  const existing = rooms.get(docId);
  if (existing) return existing;

  const ydoc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(ydoc);
  awareness.setLocalState(null);

  // Redis ক্যাশ থেকে পূর্বের CRDT বাইনারি স্টেট রিস্টোর করা
  if (redisConnected) {
    try {
      const cachedBase64 = await pubClient.get(`vesperasync:doc:${docId}:state`);
      if (cachedBase64) {
        const stateBytes = new Uint8Array(Buffer.from(cachedBase64, "base64"));
        Y.applyUpdate(ydoc, stateBytes, "bootstrap");
      }
      await subClient.subscribe(`vesperasync:room:${docId}`);
    } catch (err) {
      console.warn(`[Room Hydrate] doc=${docId}:`, err);
    }
  }

  const room: DocumentRoom = {
    docId,
    ydoc,
    awareness,
    conns: new Set(),
    persistTimer: null,
  };

  // লোকাল CRDT আপডেট হলে অন্য ক্লায়েন্ট ও Redis-এ ব্রডকাস্ট
  ydoc.on("update", (update: Uint8Array, origin: unknown) => {
    if (origin === "bootstrap") return;

    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MSG_SYNC);
    syncProtocol.writeUpdate(encoder, update);
    const packet = encoding.toUint8Array(encoder);

    const senderSocket =
      origin && typeof origin === "object" && "readyState" in origin
        ? (origin as AuthenticatedSocket)
        : undefined;

    broadcastToRoom(room, packet, senderSocket);

    if (origin !== "redis") {
      publishToRedis(docId, packet);
      schedulePersist(room);
    }
  });

  // লাইভ কার্সার ও প্রেজেন্স আপডেট ব্রডকাস্ট
  awareness.on(
    "update",
    (
      { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown
    ) => {
      const changedClients = added.concat(updated, removed);
      if (origin && typeof origin === "object" && "controlledIds" in origin) {
        const clientConn = origin as AuthenticatedSocket;
        added.forEach((id) => clientConn.controlledIds.add(id));
        removed.forEach((id) => clientConn.controlledIds.delete(id));
      }

      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MSG_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      );
      const packet = encoding.toUint8Array(encoder);

      broadcastToRoom(room, packet);
      if (origin !== "redis") {
        publishToRedis(docId, packet);
      }
    }
  );

  rooms.set(docId, room);
  return room;
}

async function authenticateRequest(req: http.IncomingMessage) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const docId = url.searchParams.get("docId");
  let token = url.searchParams.get("token");

  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)vesperasync_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!docId || !token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = payload as unknown as AuthUser;

    const document = await prisma.document.findUnique({
      where: { id: docId },
      select: { id: true, workspaceId: true, isArchived: true },
    });

    if (!document || document.isArchived) return null;

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.userId,
          workspaceId: document.workspaceId,
        },
      },
      select: { role: true },
    });

    if (!membership) return null;

    return { user, docId, role: membership.role };
  } catch {
    return null;
  }
}

async function startServer() {
  await initRedis();

  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          service: "VesperaSync Realtime Engine",
          instance: INSTANCE_ID,
          activeRooms: rooms.size,
          redisConnected,
        })
      );
      return;
    }
    res.writeHead(404);
    res.end();
  });

  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (req, socket, head) => {
    const auth = await authenticateRequest(req);
    if (!auth) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      const client = ws as AuthenticatedSocket;
      client.user = auth.user;
      client.docId = auth.docId;
      client.role = auth.role;
      client.isAlive = true;
      client.controlledIds = new Set();
      wss.emit("connection", client);
    });
  });

  wss.on("connection", async (ws: AuthenticatedSocket) => {
    const room = await getOrCreateRoom(ws.docId);
    room.conns.add(ws);

    // ১. সংযোগ স্থাপনের সাথে সাথে Sync Step 1 পাঠানো
    const syncEncoder = encoding.createEncoder();
    encoding.writeVarUint(syncEncoder, MSG_SYNC);
    syncProtocol.writeSyncStep1(syncEncoder, room.ydoc);
    ws.send(encoding.toUint8Array(syncEncoder));

    // ২. আগে থেকে থাকা সদস্যদের লাইভ কার্সার অবস্থা পাঠানো
    const awarenessStates = room.awareness.getStates();
    if (awarenessStates.size > 0) {
      const awEncoder = encoding.createEncoder();
      encoding.writeVarUint(awEncoder, MSG_AWARENESS);
      encoding.writeVarUint8Array(
        awEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          room.awareness,
          Array.from(awarenessStates.keys())
        )
      );
      ws.send(encoding.toUint8Array(awEncoder));
    }

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (raw: RawData) => {
      try {
        const data =
          raw instanceof ArrayBuffer
            ? new Uint8Array(raw)
            : Array.isArray(raw)
            ? new Uint8Array(Buffer.concat(raw))
            : new Uint8Array(raw);

        const decoder = decoding.createDecoder(data);
        const msgType = decoding.readVarUint(decoder);

        if (msgType === MSG_SYNC) {
          const syncSubType = decoding.peekVarUint(decoder);
          // VIEWER রোল হলে কেবল রিড-ওনলি সিঙ্ক অনুমোদিত
          if (ws.role === "VIEWER" && syncSubType !== 0) {
            return;
          }

          const replyEncoder = encoding.createEncoder();
          encoding.writeVarUint(replyEncoder, MSG_SYNC);
          syncProtocol.readSyncMessage(decoder, replyEncoder, room.ydoc, ws);

          if (encoding.length(replyEncoder) > 1) {
            ws.send(encoding.toUint8Array(replyEncoder));
          }
        } else if (msgType === MSG_AWARENESS) {
          const update = decoding.readVarUint8Array(decoder);
          awarenessProtocol.applyAwarenessUpdate(room.awareness, update, ws);
        }
      } catch (err) {
        console.error(`[WS Message Error] user=${ws.user.email}:`, err);
      }
    });

    ws.on("close", async () => {
      room.conns.delete(ws);

      if (ws.controlledIds.size > 0) {
        awarenessProtocol.removeAwarenessStates(
          room.awareness,
          Array.from(ws.controlledIds),
          null
        );
      }

      if (room.conns.size === 0) {
        if (room.persistTimer) clearTimeout(room.persistTimer);
        await persistRoomState(room);
        if (redisConnected) {
          await subClient.unsubscribe(`vesperasync:room:${room.docId}`).catch(() => {});
        }
        room.awareness.destroy();
        room.ydoc.destroy();
        rooms.delete(room.docId);
      }
    });
  });

  // ৩০ সেকেন্ড পরপর মৃত সংযোগ পরিষ্কার করার হার্টবিট
  const heartbeat = setInterval(() => {
    wss.clients.forEach((client) => {
      const authClient = client as AuthenticatedSocket;
      if (!authClient.isAlive) {
        authClient.terminate();
        return;
      }
      authClient.isAlive = false;
      authClient.ping();
    });
  }, 30000);

  const shutdown = async () => {
    clearInterval(heartbeat);
    for (const room of rooms.values()) {
      await persistRoomState(room);
    }
    if (redisConnected) {
      await Promise.all([pubClient.quit(), subClient.quit()]);
    }
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  server.listen(PORT, () => {
    console.log(
      `🚀 VesperaSync Binary WebSocket & CRDT Server running on ws://localhost:${PORT}`
    );
  });
}

startServer();