// B"H — Simple tunnel lane: With approval (Yaakov 2026-10-15)
// File-based command tunnel with a manual approval step.
// Flow: agent requests pairing -> user approves via file -> agent polls.
// Simpler than RSA pairing: just a file flag.
//
// Agent requests: POST /api/tunnel/simple/request {agentId}
// Server creates: /tmp/simple-tunnel-approvals/<agentId>.json {status: "pending"}
// User approves: touch /tmp/simple-tunnel-approvals/<agentId>.approved
// Agent polls: GET /api/tunnel/simple/approved?agentId=... -> {approved: true/false}
// Then agent uses the standard poll loop.

const https = require("node:https");
const fs = require("node:fs");
const { exec } = require("node:child_process");

const SERVER = process.env.TUNNEL_SERVER || "https://awtsmoos.com";
const AGENT_ID = process.env.TUNNEL_AGENT_ID || require("node:os").hostname();
const QUEUE_FILE = process.env.TUNNEL_QUEUE_FILE || "/tmp/simple-tunnel-queue.json";
const POLL_MS = 3000;

function api(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SERVER + path);
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      timeout: 10000,
      headers: {
        "User-Agent": "simple-tunnel-agent-approval/1.0",
        ...(data ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } : {})
      }
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
    if (data) req.write(data);
    req.end();
  });
}

async function waitForApproval() {
  console.log(`[tunnel] Requesting approval for agent: ${AGENT_ID}`);
  await api(`/api/tunnel/simple/request`, "POST", { agentId: AGENT_ID });
  console.log(`[tunnel] Waiting for approval... (approve via: touch /tmp/simple-tunnel-approvals/${AGENT_ID}.approved on server)`);
  while (true) {
    const res = await api(`/api/tunnel/simple/approved?agentId=${encodeURIComponent(AGENT_ID)}`);
    if (res && res.approved) {
      console.log("[tunnel] Approved!");
      return;
    }
    await new Promise(r => setTimeout(r, 3000));
  }
}

function writeResult(id, output) {
  try {
    const store = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
    store.results[id] = { output: String(output).slice(0, 50000), completedAt: new Date().toISOString() };
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(store));
  } catch (e) { /* ignore */ }
}

async function pollLoop() {
  try {
    const cmd = await api(`/api/tunnel/control/simple/poll?agentId=${encodeURIComponent(AGENT_ID)}`);
    if (cmd && cmd.ok && cmd.command) {
      exec(cmd.command, { timeout: 60000 }, (err, stdout, stderr) => {
        writeResult(cmd.id, (stdout || "") + (stderr || ""));
      });
    }
  } catch (e) { /* retry */ }
  setTimeout(pollLoop, POLL_MS);
}

(async () => {
  await waitForApproval();
  pollLoop();
})();
