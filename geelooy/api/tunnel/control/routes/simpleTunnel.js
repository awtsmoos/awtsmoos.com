// B"H — Simple tunnel command queue (Yaakov 2026-10-15)
// TEMPORARY fallback until full pairing system is fixed.
// Minimal: agent polls for commands, executes, posts results.
// Uses file-based store for multi-process compatibility.

const fs = require("node:fs");
const { body, query } = require("../core/request.js");
const STORE_PATH = "/tmp/simple-tunnel-queue.json";

function loadStore() {
  try {
    const data = fs.readFileSync(STORE_PATH, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return { pending: [], results: {}, nextId: 1 };
  }
}

function saveStore(store) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store));
  } catch (e) {
    // Ignore write errors
  }
}

async function checkSecret($i) {
  const q = query($i) || {};
  const b = await body($i).catch(() => ({})) || {};
  const secret = q.secret || b.secret;
  // B"H — Direct comparison (temporary). Avoids in-memory Set issues across processes.
  return secret === "965e29cfea49bf116e9ede9f3deff2adcb441d2dede90e5586fb3f722e1bc16c";
}

async function getBody($i) {
  try {
    return await body($i) || {};
  } catch (e) {
    return {};
  }
}

function getQuery($i) {
  try {
    return query($i) || {};
  } catch (e) {
    return {};
  }
}

async function queueCommand($i) {
  if (!(await checkSecret($i))) {
    return { statusCode: 403, response: JSON.stringify({ ok: false, error: "bad_secret" }) };
  }
  const b = await getBody($i);
  // B"H — Yaakov 2026-10-15: Support GET for AI assistants that can't POST.
  // Query params: ?command=...&id=...&agentId=...
  const q = query($i) || {};
  const command = b.command || q.command;
  const customId = b.id || q.id;
  if (!command || typeof command !== "string") {
    return { statusCode: 400, response: JSON.stringify({ ok: false, error: "missing_command" }) };
  }
  // B"H — Yaakov 2026-10-15: Tunnel selection. If agentId is specified,
  // only that agent will pick up the command. Otherwise any agent can.
  const targetAgentId = (b.agentId || q.agentId) ? String(b.agentId || q.agentId).slice(0, 100) : null;
  const store = loadStore();
  const id = customId ? String(customId).slice(0, 100) : `cmd_${store.nextId++}_${Date.now()}`;
  store.pending.push({ id, command, targetAgentId, createdAt: new Date().toISOString() });
  saveStore(store);
  // B"H — Yaakov 2026-10-15: Push via WebSocket to the target agent (if connected).
  // The agent also polls as fallback, so this is a latency optimization.
  if (targetAgentId && $i.ws) {
    try {
      $i.ws.sendToAlias(`tunnel:${targetAgentId}`, {
        type: "command",
        id: id,
        command: command
      });
    } catch (e) {
      // B"H — WS push is best-effort; polling fallback ensures delivery.
    }
  }
  return { statusCode: 200, response: JSON.stringify({ ok: true, id }) };
}

async function pollCommand($i) {
  // B"H — TEMPORARY: No auth for poll (agent needs to connect).
  // The cmd endpoint (queue) still requires auth.
  // B"H — Yaakov 2026-10-15: Agent identifies itself to get targeted commands.
  const q = getQuery($i);
  const b = await getBody($i).catch(() => ({}));
  const agentId = String(q.agentId || b.agentId || "").slice(0, 100);
  const store = loadStore();
  // Find first command for this agent (or untargeted)
  let cmdIndex = -1;
  for (let i = 0; i < store.pending.length; i++) {
    const c = store.pending[i];
    if (!c.targetAgentId || c.targetAgentId === agentId) {
      cmdIndex = i;
      break;
    }
  }
  if (cmdIndex === -1) {
    return { statusCode: 200, response: JSON.stringify({ ok: true, command: null }) };
  }
  const cmd = store.pending.splice(cmdIndex, 1)[0];
  saveStore(store);
  return { statusCode: 200, response: JSON.stringify({ ok: true, id: cmd.id, command: cmd.command }) };
}

async function postResult($i) {
  // B"H — TEMPORARY: No auth for postResult (agent needs to post).
  const b = await getBody($i);
  const { id, output } = b;
  if (!id) {
    return { statusCode: 400, response: JSON.stringify({ ok: false, error: "missing_id" }) };
  }
  const store = loadStore();
  store.results[id] = { output: String(output || ""), completedAt: new Date().toISOString() };
  saveStore(store);
  return { statusCode: 200, response: JSON.stringify({ ok: true }) };
}

async function getResult($i) {
  if (!(await checkSecret($i))) {
    return { statusCode: 403, response: JSON.stringify({ ok: false, error: "bad_secret" }) };
  }
  const q = getQuery($i);
  const id = q.id;
  const store = loadStore();
  const result = store.results[id];
  if (!result) {
    return { statusCode: 200, response: JSON.stringify({ ok: true, done: false }) };
  }
  delete store.results[id]; // One-time read
  saveStore(store);
  return { statusCode: 200, response: JSON.stringify({ ok: true, done: true, output: result.output }) };
}

// B"H — Temporary setup endpoint DISABLED (Yaakov 2026-10-15).
// Security hole: was unauthenticated with hardcoded secret. Removed.
async function setup($i) {
  return { statusCode: 410, response: JSON.stringify({ ok: false, error: "endpoint_disabled" }) };
}

module.exports = { queueCommand, pollCommand, postResult, getResult, setup, requestApproval, checkApproval };

// B"H — Approval lane endpoints (Yaakov 2026-10-15)
// File-based approval: agent requests, user touches .approved file on server.
const APPROVAL_DIR = "/tmp/simple-tunnel-approvals";

async function requestApproval($i) {
  const b = await getBody($i);
  const agentId = String(b.agentId || "").slice(0, 100);
  if (!agentId) {
    return { statusCode: 400, response: JSON.stringify({ ok: false, error: "missing_agentId" }) };
  }
  try {
    fs.mkdirSync(APPROVAL_DIR, { recursive: true, mode: 0o700 });
    const reqFile = `${APPROVAL_DIR}/${agentId}.json`;
    if (!fs.existsSync(reqFile)) {
      fs.writeFileSync(reqFile, JSON.stringify({ agentId, status: "pending", requestedAt: new Date().toISOString() }));
    }
    return { statusCode: 200, response: JSON.stringify({ ok: true, status: "pending" }) };
  } catch (e) {
    return { statusCode: 500, response: JSON.stringify({ ok: false, error: e.message }) };
  }
}

async function checkApproval($i) {
  const q = getQuery($i);
  const agentId = String(q.agentId || "").slice(0, 100);
  if (!agentId) {
    return { statusCode: 400, response: JSON.stringify({ ok: false, error: "missing_agentId" }) };
  }
  try {
    const approvedFile = `${APPROVAL_DIR}/${agentId}.approved`;
    const approved = fs.existsSync(approvedFile);
    return { statusCode: 200, response: JSON.stringify({ ok: true, approved }) };
  } catch (e) {
    return { statusCode: 500, response: JSON.stringify({ ok: false, error: e.message }) };
  }
}
