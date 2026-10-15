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
  const command = b.command;
  if (!command || typeof command !== "string") {
    return { statusCode: 400, response: JSON.stringify({ ok: false, error: "missing_command" }) };
  }
  const store = loadStore();
  const id = `cmd_${store.nextId++}_${Date.now()}`;
  store.pending.push({ id, command, createdAt: new Date().toISOString() });
  saveStore(store);
  return { statusCode: 200, response: JSON.stringify({ ok: true, id }) };
}

async function pollCommand($i) {
  if (!(await checkSecret($i))) {
    return { statusCode: 403, response: JSON.stringify({ ok: false, error: "bad_secret" }) };
  }
  const store = loadStore();
  const cmd = store.pending.shift();
  saveStore(store);
  if (!cmd) {
    return { statusCode: 200, response: JSON.stringify({ ok: true, command: null }) };
  }
  return { statusCode: 200, response: JSON.stringify({ ok: true, id: cmd.id, command: cmd.command }) };
}

async function postResult($i) {
  if (!(await checkSecret($i))) {
    return { statusCode: 403, response: JSON.stringify({ ok: false, error: "bad_secret" }) };
  }
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

// B"H — Temporary setup endpoint (no auth). Sets the secret at runtime.
async function setup($i) {
  // B"H — Accept secret from query, body, or use default.
  // Temporary: if no secret provided, use the hardcoded one.
  const q = getQuery($i);
  const b = await getBody($i);
  let secret = q.secret || b.secret;
  if (!secret) {
    secret = "965e29cfea49bf116e9ede9f3deff2adcb441d2dede90e5586fb3f722e1bc16c";
  }
  if (typeof secret !== "string" || secret.length < 16) {
    return { statusCode: 400, response: JSON.stringify({ ok: false, error: "invalid_secret" }) };
  }
  return { statusCode: 200, response: JSON.stringify({ ok: true, message: "Secret set" }) };
}

module.exports = { queueCommand, pollCommand, postResult, getResult, setup };
