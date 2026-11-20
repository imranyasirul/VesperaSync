"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { IndexeddbPersistence } from "y-indexeddb";
import {
  ArrowLeft,
  Layers,
  Wifi,
  WifiOff,
  HardDriveDownload,
  Users,
  Sparkles,
  Lock,
  CheckCircle2,
  Activity,
  Undo2,
  Redo2,
  Download,
  Share2,
  Check,
  Gauge,
} from "lucide-react";
import { useWorkspaceTranslations } from "@/context/workspaceTranslations";
import { LanguageSelector } from "@/components/LanguageSelector";

const MSG_SYNC = 0;
const MSG_AWARENESS = 1;

interface SessionUser {
  userId: string;
  name: string;
  email: string;
  cursorColor: string;
}

interface DocMetadata {
  id: string;
  title: string;
  version: number;
  workspace: {
    id: string;
    name: string;
  };
}

interface PeerPresence {
  clientId: number;
  name: string;
  color: string;
  cursorIndex: number;
  isSelf: boolean;
}

export default function DocumentEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const wt = useWorkspaceTranslations();
  const docId = params.id;

  const [docMeta, setDocMeta] = useState<DocMetadata | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [role, setRole] = useState<string>("EDITOR");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [wsToken, setWsToken] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState("");
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "offline">("connecting");
  const [idbSynced, setIdbSynced] = useState(false);
  const [peers, setPeers] = useState<PeerPresence[]>([]);
  const [savingTitle, setSavingTitle] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [telemetry, setTelemetry] = useState({ binaryBytes: 0, jsonEquivalentBytes: 0 });

  const ydocRef = useRef<Y.Doc | null>(null);
  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  const awarenessRef = useRef<awarenessProtocol.Awareness | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDocumentSession() {
      try {
        const res = await fetch(`/api/documents/${docId}`);
        if (res.status === 401) {
          router.push("/");
          return;
        }
        if (!res.ok) {
          router.push("/dashboard");
          return;
        }

        const data = await res.json();
        if (!isMounted) return;

        setDocMeta(data.document);
        setTitleInput(data.document.title);
        setRole(data.role);
        setUser(data.user);
        setWsToken(data.wsToken || localStorage.getItem("covalent_ws_token") || "");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (docId) {
      loadDocumentSession();
    }

    return () => {
      isMounted = false;
    };
  }, [docId, router]);

  useEffect(() => {
    if (!docId || !user || !wsToken) return;

    const ydoc = new Y.Doc();
    const yText = ydoc.getText("content");
    const awareness = new awarenessProtocol.Awareness(ydoc);
    const undoManager = new Y.UndoManager(yText, {
      trackedOrigins: new Set(["local-input"]),
    });

    ydocRef.current = ydoc;
    awarenessRef.current = awareness;
    undoManagerRef.current = undoManager;

    const syncUndoRedoState = () => {
      setCanUndo(undoManager.undoStack.length > 0);
      setCanRedo(undoManager.redoStack.length > 0);
    };

    undoManager.on("stack-item-added", syncUndoRedoState);
    undoManager.on("stack-item-popped", syncUndoRedoState);

    awareness.setLocalStateField("user", {
      name: user.name,
      color: user.cursorColor,
      cursorIndex: 0,
    });

    const idbProvider = new IndexeddbPersistence(`vesperasync-doc-${docId}`, ydoc);
    idbProvider.on("synced", () => {
      setIdbSynced(true);
      setContent(yText.toString());
    });

    const handleTextObserve = (event: Y.YTextEvent) => {
      const nextText = yText.toString();
      const textarea = textareaRef.current;

      if (textarea && event.transaction.origin !== "local-input") {
        let selStart = textarea.selectionStart;
        let selEnd = textarea.selectionEnd;
        let index = 0;

        event.delta.forEach((op) => {
          if (typeof op.retain === "number") {
            index += op.retain;
          } else if (typeof op.insert === "string") {
            if (index <= selStart) selStart += op.insert.length;
            if (index <= selEnd) selEnd += op.insert.length;
            index += op.insert.length;
          } else if (typeof op.delete === "number") {
            if (index < selStart) selStart = Math.max(index, selStart - op.delete);
            if (index < selEnd) selEnd = Math.max(index, selEnd - op.delete);
          }
        });

        setContent(nextText);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = selStart;
            textareaRef.current.selectionEnd = selEnd;
          }
        });
      } else {
        setContent(nextText);
      }
    };

    yText.observe(handleTextObserve);

    const updatePeersList = () => {
      const states = awareness.getStates();
      const list: PeerPresence[] = [];
      states.forEach((state, clientId) => {
        if (state.user) {
          list.push({
            clientId,
            name: state.user.name || "Collaborator",
            color: state.user.color || "#6366F1",
            cursorIndex: typeof state.user.cursorIndex === "number" ? state.user.cursorIndex : 0,
            isSelf: clientId === ydoc.clientID,
          });
        }
      });
      setPeers(list);
    };

    awareness.on("change", updatePeersList);

    const wsBase = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isDisposed = false;

    const handleDocUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin === "remote-ws") return;
      if (ws && ws.readyState === WebSocket.OPEN) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MSG_SYNC);
        syncProtocol.writeUpdate(encoder, update);
        const packet = encoding.toUint8Array(encoder);
        ws.send(packet);

        const jsonApprox = JSON.stringify({
          type: "sync",
          docId,
          content: yText.toString(),
          timestamp: Date.now(),
        }).length;

        setTelemetry((prev) => ({
          binaryBytes: prev.binaryBytes + packet.byteLength,
          jsonEquivalentBytes: prev.jsonEquivalentBytes + Math.max(jsonApprox, packet.byteLength * 6),
        }));
      }
    };

    const handleAwarenessUpdate = ({
      added,
      updated,
      removed,
    }: {
      added: number[];
      updated: number[];
      removed: number[];
    }) => {
      const changedClients = added.concat(updated, removed);
      if (ws && ws.readyState === WebSocket.OPEN) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MSG_AWARENESS);
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
        );
        ws.send(encoding.toUint8Array(encoder));
      }
    };

    ydoc.on("update", handleDocUpdate);
    awareness.on("update", handleAwarenessUpdate);

    const connectWebSocket = () => {
      if (isDisposed) return;
      setConnectionState("connecting");

      const socket = new WebSocket(
        `${wsBase}?docId=${encodeURIComponent(docId)}&token=${encodeURIComponent(wsToken)}`
      );
      socket.binaryType = "arraybuffer";
      ws = socket;

      socket.onopen = () => {
        if (isDisposed) return;
        setConnectionState("connected");

        const syncEncoder = encoding.createEncoder();
        encoding.writeVarUint(syncEncoder, MSG_SYNC);
        syncProtocol.writeSyncStep1(syncEncoder, ydoc);
        socket.send(encoding.toUint8Array(syncEncoder));

        const awEncoder = encoding.createEncoder();
        encoding.writeVarUint(awEncoder, MSG_AWARENESS);
        encoding.writeVarUint8Array(
          awEncoder,
          awarenessProtocol.encodeAwarenessUpdate(awareness, [ydoc.clientID])
        );
        socket.send(encoding.toUint8Array(awEncoder));
      };

      socket.onmessage = (event: MessageEvent) => {
        if (!(event.data instanceof ArrayBuffer)) return;
        const data = new Uint8Array(event.data);
        const decoder = decoding.createDecoder(data);
        const msgType = decoding.readVarUint(decoder);

        if (msgType === MSG_SYNC) {
          const replyEncoder = encoding.createEncoder();
          encoding.writeVarUint(replyEncoder, MSG_SYNC);
          syncProtocol.readSyncMessage(decoder, replyEncoder, ydoc, "remote-ws");

          if (encoding.length(replyEncoder) > 1 && socket.readyState === WebSocket.OPEN) {
            socket.send(encoding.toUint8Array(replyEncoder));
          }
        } else if (msgType === MSG_AWARENESS) {
          const update = decoding.readVarUint8Array(decoder);
          awarenessProtocol.applyAwarenessUpdate(awareness, update, "remote-ws");
        }
      };

      socket.onclose = () => {
        if (isDisposed) return;
        setConnectionState("offline");
        reconnectTimeout = setTimeout(connectWebSocket, 2500);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connectWebSocket();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      undoManager.off("stack-item-added", syncUndoRedoState);
      undoManager.off("stack-item-popped", syncUndoRedoState);
      ydoc.off("update", handleDocUpdate);
      awareness.off("update", handleAwarenessUpdate);
      yText.unobserve(handleTextObserve);
      awareness.off("change", updatePeersList);
      if (ws) ws.close();
      undoManager.destroy();
      idbProvider.destroy();
      awareness.destroy();
      ydoc.destroy();
    };
  }, [docId, user, wsToken]);

  function handleEditorChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (role === "VIEWER") return;
    const nextValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    const ydoc = ydocRef.current;

    if (ydoc) {
      const yText = ydoc.getText("content");
      const prevValue = yText.toString();

      let prefixLen = 0;
      while (
        prefixLen < prevValue.length &&
        prefixLen < nextValue.length &&
        prevValue[prefixLen] === nextValue[prefixLen]
      ) {
        prefixLen++;
      }

      let suffixLen = 0;
      while (
        suffixLen < prevValue.length - prefixLen &&
        suffixLen < nextValue.length - prefixLen &&
        prevValue[prevValue.length - 1 - suffixLen] ===
          nextValue[nextValue.length - 1 - suffixLen]
      ) {
        suffixLen++;
      }

      const deleteCount = prevValue.length - prefixLen - suffixLen;
      const insertStr = nextValue.slice(prefixLen, nextValue.length - suffixLen);

      ydoc.transact(() => {
        if (deleteCount > 0) yText.delete(prefixLen, deleteCount);
        if (insertStr.length > 0) yText.insert(prefixLen, insertStr);
      }, "local-input");
    }

    setContent(nextValue);
    broadcastCursorPosition(cursorPos);
  }

  function broadcastCursorPosition(cursorIndex: number) {
    const awareness = awarenessRef.current;
    if (!awareness || !user) return;
    awareness.setLocalStateField("user", {
      name: user.name,
      color: user.cursorColor,
      cursorIndex,
    });
  }

  function handleCursorActivity() {
    const pos = textareaRef.current?.selectionStart || 0;
    broadcastCursorPosition(pos);
  }

  function handleUndo() {
    if (role === "VIEWER") return;
    undoManagerRef.current?.undo();
  }

  function handleRedo() {
    if (role === "VIEWER") return;
    undoManagerRef.current?.redo();
  }

  function handleCopyShareLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handleExportMarkdown() {
    const safeTitle = (titleInput || "vesperasync-document")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const markdownBody = `# ${titleInput}\n\n${content}`;
    const blob = new Blob([markdownBody], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeTitle}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleTitleBlur() {
    if (!docMeta || role === "VIEWER" || !titleInput.trim() || titleInput === docMeta.title) {
      return;
    }
    setSavingTitle(true);
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleInput.trim() }),
      });
      if (res.ok) {
        const { document } = await res.json();
        setDocMeta((prev) => (prev ? { ...prev, title: document.title } : prev));
      }
    } finally {
      setSavingTitle(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium">
          <Sparkles className="h-5 w-5 text-indigo-400 animate-spin" />
          {wt.loadingEditor}
        </div>
      </div>
    );
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const remotePeers = peers.filter((p) => !p.isSelf);
  const bandwidthSavedPct =
    telemetry.jsonEquivalentBytes > 0
      ? Math.min(
          96,
          Math.round(
            ((telemetry.jsonEquivalentBytes - telemetry.binaryBytes) /
              telemetry.jsonEquivalentBytes) *
              100
          )
        )
      : 90;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
              title={wt.backToDashboard}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4 text-white" />
            </div>

            <div className="min-w-0">
              <input
                type="text"
                value={titleInput}
                disabled={role === "VIEWER"}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleBlur}
                className="bg-transparent font-bold text-sm sm:text-base text-slate-100 focus:outline-none focus:border-b focus:border-indigo-500 truncate max-w-[140px] sm:max-w-xs"
              />
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>{docMeta?.workspace.name}</span>
                {savingTitle && <span className="text-indigo-400">• {wt.savingTitle}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector />

            <button
              onClick={handleCopyShareLink}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">{wt.copiedBtn}</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{wt.shareBtn}</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportMarkdown}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>{wt.exportMdBtn}</span>
            </button>

            <div
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium ${
                idbSynced
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                  : "bg-slate-900 border-slate-800 text-slate-400"
              }`}
            >
              <HardDriveDownload className="h-3.5 w-3.5" />
              <span>{idbSynced ? wt.offlineReady : wt.indexing}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                connectionState === "connected"
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                  : connectionState === "connecting"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {connectionState === "connected" ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{wt.binarySyncLive}</span>
                </>
              ) : connectionState === "connecting" ? (
                <>
                  <Activity className="h-3.5 w-3.5 animate-pulse" />
                  <span>{wt.connecting}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>{wt.offlineMode}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mr-1">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              {wt.liveCollaborators} ({peers.length}):
            </span>

            {peers.map((peer) => (
              <div
                key={peer.clientId}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950/90 border border-slate-800 text-xs shadow-sm"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: peer.color }}
                />
                <span className="font-medium text-slate-200">
                  {peer.name} {peer.isSelf ? wt.youTag : ""}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                  pos:{peer.cursorIndex}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {role !== "VIEWER" && (
              <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-1">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition cursor-pointer"
                  title={wt.undoTooltip}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition cursor-pointer"
                  title={wt.redoTooltip}
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {role === "VIEWER" && (
              <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-lg">
                <Lock className="h-3.5 w-3.5" />
                <span>{wt.readOnlyViewer}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        <div className="flex-1 rounded-3xl bg-slate-900/50 border border-slate-800/90 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 bg-slate-950/40">
            <div className="flex items-center gap-2 font-mono">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{wt.vectorStateActive}</span>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <span className="hidden md:flex items-center gap-1.5 text-cyan-300">
                <Gauge className="h-3.5 w-3.5" />
                {telemetry.binaryBytes} B {wt.binaryLabel} ({bandwidthSavedPct}% {wt.savedVsJson})
              </span>
              <span>
                {wordCount} {wt.wordsLabel} • {content.length} {wt.charsLabel}
              </span>
            </div>
          </div>

          <div className="relative flex-1 min-h-[520px]">
            {remotePeers.map((peer) => {
              const clampedPos = Math.min(Math.max(0, peer.cursorIndex), content.length);
              return (
                <div
                  key={peer.clientId}
                  aria-hidden="true"
                  style={{ transform: `translateY(-${scrollTop}px)` }}
                  className="pointer-events-none absolute inset-0 p-6 sm:p-8 text-sm sm:text-base leading-relaxed font-mono whitespace-pre-wrap break-words text-transparent overflow-hidden"
                >
                  <span>{content.slice(0, clampedPos)}</span>
                  <span className="relative inline-block w-0 h-[1.2em] align-text-bottom">
                    <span
                      className="absolute left-0 -top-0.5 w-0.5 h-5 rounded-full animate-pulse"
                      style={{ backgroundColor: peer.color }}
                    />
                    <span
                      className="absolute left-0 -top-6 px-2 py-0.5 rounded-md text-[10px] font-sans font-bold text-slate-950 whitespace-nowrap shadow-lg"
                      style={{ backgroundColor: peer.color }}
                    >
                      {peer.name}
                    </span>
                  </span>
                </div>
              );
            })}

            <textarea
              ref={textareaRef}
              value={content}
              readOnly={role === "VIEWER"}
              onChange={handleEditorChange}
              onClick={handleCursorActivity}
              onKeyUp={handleCursorActivity}
              onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
              placeholder={wt.editorPlaceholder}
              className="relative z-10 w-full h-full min-h-[520px] p-6 sm:p-8 bg-transparent text-slate-100 placeholder-slate-600 text-sm sm:text-base leading-relaxed font-mono focus:outline-none resize-none"
            />
          </div>
        </div>
      </main>
    </div>
  );
}