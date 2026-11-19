import "dotenv/config";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT) || 4000;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  console.log("নতুন ক্লায়েন্ট ওয়েবসকেটে যুক্ত হয়েছে");
  ws.on("close", () => {
    console.log("ক্লায়েন্ট সংযোগ বিচ্ছিন্ন হয়েছে");
  });
});

console.log(`কভ্যালেন্ট রিয়েল-টাইম সার্ভার চলছে পোর্ট ${PORT}-এ`);
