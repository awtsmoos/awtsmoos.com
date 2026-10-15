// B"H — Simple tunnel lane: Polling (no approval)
// Yaakov 2026-10-15
// Minimal file-based command tunnel. Agent polls server, executes commands.
// No pairing, no RSA, no approval. For trusted environments.
// Server: geelooy/api/tunnel/control/routes/simpleTunnel.js
// Agent: geelooy/api/tunnel/lanes/simple/agent-poll.js

const https = require("node:https");
const fs = require("node:fs");
const { exec } = require("node:child_process");

const SERVER = process.env.TUNNEL_SERVER || "https://awtsmoos.com";
const SECRET = process.env.TUNNEL_SECRET || "";
const AGENT_ID = process.env.TUNNEL_AGENT_ID || require("node:os").hostname();
const QUEUE_FILE = process.env.TUNNEL_QUEUE_FILE || "/tmp/simple-tunnel-queue.json";
const POLL_MS = parseInt(process.env.TUNNEL_POLL_MS || "3000", 10);

function api(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(SERVER + path);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "GET",
      timeout: 10000,
      headers: { "User-Agent": "simple-tunnel-agent/3.0" }
    }, (res) => {
      let chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { resolve({ ok: false }); }
      });
    });
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.on("error", reject);
    req.end();
  });
}

function writeResult(id, output) {
  try {
    const store = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
    store.results[id] = { output: String(output).slice(0, 50000), completedAt: new Date().toISOString() };
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(store));
  } catch (e) { /* ignore */ }
}

async function poll() {
  try {
    const params = new URLSearchParams();
    if (SECRET) params.set("secret", SECRET);
    params.set("agentId", AGENT_ID);
    const cmd = await api(`/api/tunnel/control/simple/poll?${params.toString()}`);
    if (cmd && cmd.ok && cmd.command) {
      exec(cmd.command, { timeout: 60000 }, (err, stdout, stderr) => {
        writeResult(cmd.id, (stdout || "") + (stderr || ""));
      });
    }
  } catch (e) { /* retry silently */ }
  setTimeout(poll, POLL_MS);
}

poll();
