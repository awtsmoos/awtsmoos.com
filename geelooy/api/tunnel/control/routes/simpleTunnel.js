// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * A small native-agent compatibility queue, distinct from the advanced WS tunnel.
 * Every command is explicitly targeted, both clients and polling agents authenticate,
 * GET-only clients may sign short-lived URLs, and results return to the server.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { body, query } = require("../core/request.js");
const Auth = require("./simpleTunnelAuth.js");
const Store = require("./simpleTunnelStore.js");

function reply(statusCode, payload) {
  return { statusCode, response: JSON.stringify({ BH: 'B"H', ...payload }) };
}
function invalid(auth) {
  return reply(auth.status || 403, { ok: false, error: auth.error || "simple_tunnel_permission_denied" });
}
function agentId(value) {
  const id = String(value || "").trim();
  return /^[a-zA-Z0-9._-]{1,100}$/.test(id) ? id : "";
}
function resultId(value) {
  const id = String(value || "");
  return /^simple_[A-Za-z0-9_-]{32,80}$/.test(id) ? id : "";
}
function nonceClaim(store, authorized) {
  if (authorized.mechanism !== "signed-url") return true;
  const digest = crypto.createHash("sha256").update(authorized.nonce).digest("hex");
  if (store.usedNonces[digest]) return false;
  store.usedNonces[digest] = authorized.expires;
  return true;
}
function actionError(error) {
  return reply(error.message === "simple_tunnel_store_busy" ? 503 : 500, {
    ok: false, error: error.message === "simple_tunnel_store_busy"
      ? "simple_tunnel_store_busy" : "simple_tunnel_store_unavailable"
  });
}
function runInStore(fn) {
  try { return Store.transaction(fn); }
  catch (error) { return actionError(error); }
}

async function queueCommand($i) {
  const b = await body($i), q = query($i);
  const command = b.command ?? q.command;
  const targetAgentId = agentId(b.agentId || q.agentId);
  const authorized = Auth.authorization($i, "client", "cmd", {
    body: b, agentId: targetAgentId, command
  });
  if (!authorized.ok) return invalid(authorized);
  if (!targetAgentId) return reply(400, { ok: false, error: "simple_tunnel_target_required" });
  if (typeof command !== "string" || !command.trim() || command.length > 4096 || /[\x00-\x08\x0b-\x1f\x7f]/.test(command)) {
    return reply(400, { ok: false, error: "simple_tunnel_invalid_command" });
  }
  return runInStore(store => {
    if (!nonceClaim(store, authorized)) return reply(409, { ok: false, error: "REPLAY_DETECTED" });
    if (store.pending.length >= 100) return reply(429, { ok: false, error: "simple_tunnel_queue_full" });
    const id = `simple_${crypto.randomBytes(24).toString("base64url")}`;
    store.pending.push({ id, command, agentId: targetAgentId, createdAt: Date.now() });
    return reply(200, { ok: true, id, agentId: targetAgentId, queued: true });
  });
}

async function pollCommand($i) {
  const b = await body($i), q = query($i);
  const authorized = Auth.authorization($i, "agent", "poll", { body: b, agentId: agentId(b.agentId || q.agentId) });
  if (!authorized.ok) return invalid(authorized);
  const requestingAgent = agentId(b.agentId || q.agentId);
  if (!requestingAgent) return reply(400, { ok: false, error: "simple_tunnel_agent_required" });
  return runInStore(store => {
    const index = store.pending.findIndex(item => item.agentId === requestingAgent);
    if (index < 0) return reply(200, { ok: true, command: null });
    const cmd = store.pending.splice(index, 1)[0];
    store.active[cmd.id] = { agentId: requestingAgent, createdAt: Date.now() };
    return reply(200, { ok: true, id: cmd.id, command: cmd.command, agentId: requestingAgent });
  });
}

async function postResult($i) {
  const b = await body($i);
  const authorized = Auth.authorization($i, "agent", "post", { body: b, agentId: agentId(b.agentId) });
  if (!authorized.ok) return invalid(authorized);
  const id = resultId(b.id), reportingAgent = agentId(b.agentId);
  if (!id || !reportingAgent) return reply(400, { ok: false, error: "simple_tunnel_invalid_result_identity" });
  return runInStore(store => {
    const current = store.active[id];
    if (!current || current.agentId !== reportingAgent) {
      return reply(404, { ok: false, error: "simple_tunnel_job_not_found" });
    }
    if (store.results[id]) return reply(409, { ok: false, error: "simple_tunnel_result_already_submitted" });
    const exitCode = Number.isInteger(b.exitCode) ? b.exitCode : 1;
    const output = String(b.output || "").slice(0, 64000);
    store.results[id] = { output, exitCode, truncated: String(b.output || "").length > 64000,
      completedAt: Date.now(), agentId: reportingAgent };
    return reply(200, { ok: true, id, accepted: true });
  });
}

async function getResult($i) {
  const b = await body($i), q = query($i);
  const id = resultId(q.id || b.id);
  const authorized = Auth.authorization($i, "client", "result", { body: b, id });
  if (!authorized.ok) return invalid(authorized);
  if (!id) return reply(400, { ok: false, error: "simple_tunnel_invalid_result_id" });
  return runInStore(store => {
    if (authorized.mechanism === "signed-url") {
      const nonceHash = crypto.createHash("sha256").update(authorized.nonce).digest("hex");
      if (store.usedNonces[nonceHash]) return reply(409, { ok: false, error: "REPLAY_DETECTED" });
    }
    const result = store.results[id];
    // A short-lived signed result URL can be polled repeatedly until completion;
    // consume its nonce only when the result is actually delivered.
    if (result && !nonceClaim(store, authorized)) return reply(409, { ok: false, error: "REPLAY_DETECTED" });
    if (!result) {
      return reply(200, { ok: true, done: false, id, pending: Boolean(store.active[id] || store.pending.some(c => c.id === id)) });
    }
    delete store.results[id];
    delete store.active[id];
    return reply(200, { ok: true, done: true, id, output: result.output,
      exitCode: result.exitCode, truncated: result.truncated });
  });
}

async function status($i) {
  const b = await body($i);
  const authorized = Auth.authorization($i, "client", "status", { body: b });
  if (!authorized.ok) return invalid(authorized);
  return runInStore(store => reply(200, { ok: true, pending: store.pending.length,
    active: Object.keys(store.active).length, readyResults: Object.keys(store.results).length }));
}

async function setup() {
  return reply(410, { ok: false, error: "endpoint_disabled" });
}

// Manual-approval compatibility cannot bypass the agent's independent credential.
async function requestApproval($i) {
  const b = await body($i), q = query($i);
  const auth = Auth.authorization($i, "agent", "request", { body: b, agentId: agentId(b.agentId || q.agentId) });
  if (!auth.ok) return invalid(auth);
  const id = agentId(b.agentId || q.agentId);
  if (!id) return reply(400, { ok: false, error: "simple_tunnel_invalid_agent" });
  const directory = process.env.AWTSMOOS_SIMPLE_TUNNEL_APPROVAL_DIR || "/var/lib/awtsmoos/simple-tunnel-approvals";
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const record = path.join(directory, `${id}.json`);
  try { fs.writeFileSync(record, JSON.stringify({ agentId: id, requestedAt: Date.now() }), { mode: 0o600, flag: "wx" }); }
  catch (error) { if (error.code !== "EEXIST") return actionError(error); }
  return reply(200, { ok: true, status: "pending" });
}

async function checkApproval($i) {
  const b = await body($i), q = query($i);
  const auth = Auth.authorization($i, "agent", "approved", { body: b, agentId: agentId(b.agentId || q.agentId) });
  if (!auth.ok) return invalid(auth);
  const id = agentId(b.agentId || q.agentId);
  if (!id) return reply(400, { ok: false, error: "simple_tunnel_invalid_agent" });
  const directory = process.env.AWTSMOOS_SIMPLE_TUNNEL_APPROVAL_DIR || "/var/lib/awtsmoos/simple-tunnel-approvals";
  return reply(200, { ok: true, approved: fs.existsSync(path.join(directory, `${id}.approved`)) });
}

module.exports = { queueCommand, pollCommand, postResult, getResult, status, setup, requestApproval, checkApproval };
