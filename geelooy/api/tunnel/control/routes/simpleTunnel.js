// B"H — Simple tunnel command queue (Yaakov 2026-10-15)
// TEMPORARY fallback until full pairing system is fixed.
// Minimal: agent polls for commands, executes, posts results.

const store = {
  pending: [], // {id, command, createdAt}
  results: new Map(), // id -> {output, completedAt}
  nextId: 1
};

// B"H — Simple secret (temporary). In production, use per-user secrets.
const VALID_SECRETS = new Set(["965e29cfea49bf116e9ede9f3deff2adcb441d2dede90e5586fb3f722e1bc16c"]);

function setSecret(secret) {
  VALID_SECRETS.add(secret);
}

function checkSecret($i) {
  const secret = $i.query?.secret || $i.body?.secret;
  return secret && VALID_SECRETS.has(secret);
}

async function queueCommand($i) {
  if (!checkSecret($i)) {
    return { statusCode: 403, response: JSON.stringify({ ok: false, error: "bad_secret" }) };
  }
  const command = $i.body?.command;
  if (!command || typeof command !== "string") {
    return { statusCode: 400, response: JSON.stringify({ ok: false, error: "missing_command" }) };
  }
  const id = `cmd_${store.nextId++}_${Date.now()}`;
  store.pending.push({ id, command, createdAt: new Date().toISOString() });
  return { statusCode: 200, response: JSON.stringify({ ok: true, id }) };
}

async function pollCommand($i) {
  if (!checkSecret($i)) {
    return { statusCode: 403, response: JSON.stringify({ ok: false, error: "bad_secret" }) };
  }
  const cmd = store.pending.shift();
  if (!cmd) {
    return { statusCode: 200, response: JSON.stringify({ ok: true, command: null }) };
  }
  return { statusCode: 200, response: JSON.stringify({ ok: true, id: cmd.id, command: cmd.command }) };
}

async function postResult($i) {
  if (!checkSecret($i)) {
    return { statusCode: 403, response: JSON.stringify({ ok: false, error: "bad_secret" }) };
  }
  const { id, output } = $i.body || {};
  if (!id) {
    return { statusCode: 400, response: JSON.stringify({ ok: false, error: "missing_id" }) };
  }
  store.results.set(id, { output: String(output || ""), completedAt: new Date().toISOString() });
  return { statusCode: 200, response: JSON.stringify({ ok: true }) };
}

async function getResult($i) {
  if (!checkSecret($i)) {
    return { statusCode: 403, response: JSON.stringify({ ok: false, error: "bad_secret" }) };
  }
  const id = $i.query?.id;
  const result = store.results.get(id);
  if (!result) {
    return { statusCode: 200, response: JSON.stringify({ ok: true, done: false }) };
  }
  store.results.delete(id); // One-time read
  return { statusCode: 200, response: JSON.stringify({ ok: true, done: true, output: result.output }) };
}

// B"H — Temporary setup endpoint (no auth). Sets the secret at runtime.
async function setup($i) {
  const secret = $i.query?.secret || $i.body?.secret;
  if (!secret || typeof secret !== "string" || secret.length < 16) {
    return { statusCode: 400, response: JSON.stringify({ ok: false, error: "invalid_secret" }) };
  }
  VALID_SECRETS.add(secret);
  return { statusCode: 200, response: JSON.stringify({ ok: true, message: "Secret set" }) };
}

module.exports = { queueCommand, pollCommand, postResult, getResult, setSecret, setup };
