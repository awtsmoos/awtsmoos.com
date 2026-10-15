// B"H — Simple tunnel lane: WebSocket (Yaakov 2026-10-15)
// File-based command tunnel over WebSocket for real-time bidirectional.
// Lower latency than polling. Falls back to polling if WS fails.

const fs = require("node:fs");
const { exec } = require("node:child_process");

const SERVER = process.env.TUNNEL_SERVER || "https://awtsmoos.com";
const WS_URL = SERVER.replace("https://", "wss://").replace("http://", "ws://");
const QUEUE_FILE = process.env.TUNNEL_QUEUE_FILE || "/tmp/simple-tunnel-queue.json";
const AGENT_ID = process.env.TUNNEL_AGENT_ID || require("node:os").hostname();

// B"H — Minimal WS client without external deps (uses built-in http upgrade).
// For simplicity, falls back to polling if WS unavailable.
async function startPollingFallback() {
  console.log("[tunnel] WS unavailable, falling back to polling...");
  const poll = require("./agent-poll.js");
}

function writeResult(id, output) {
  try {
    const store = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
    store.results[id] = { output: String(output).slice(0, 50000), completedAt: new Date().toISOString() };
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(store));
    console.log(`[tunnel] Result written for ${id}`);
  } catch (e) {
    console.log(`[tunnel] Write failed: ${e.message}`);
  }
}

// B"H — Try native WebSocket via dynamic import (Node 22+ has built-in WS).
async function main() {
  console.log("[tunnel] WebSocket lane starting...");
  try {
    // Use built-in WebSocket if available (Node 22+)
    if (typeof WebSocket === "undefined") {
      console.log("[tunnel] No built-in WebSocket, using polling fallback");
      return startPollingFallback();
    }
    const ws = new WebSocket(`${WS_URL}/api/tunnel/simple/ws?agentId=${encodeURIComponent(AGENT_ID)}`);
    ws.onopen = () => console.log("[tunnel] WebSocket connected");
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "command" && msg.command) {
          console.log(`[tunnel] Executing via WS: ${msg.command.slice(0, 60)}`);
          exec(msg.command, { timeout: 60000 }, (err, stdout, stderr) => {
            writeResult(msg.id, (stdout || "") + (stderr || ""));
            ws.send(JSON.stringify({ type: "result", id: msg.id }));
          });
        }
      } catch (e) {
        console.log(`[tunnel] WS message error: ${e.message}`);
      }
    };
    ws.onerror = (e) => {
      console.log("[tunnel] WS error, falling back to polling");
      ws.close();
      startPollingFallback();
    };
    ws.onclose = () => {
      console.log("[tunnel] WS closed, falling back to polling");
      startPollingFallback();
    };
  } catch (e) {
    console.log(`[tunnel] WS init failed: ${e.message}, using polling`);
    startPollingFallback();
  }
}

main();
