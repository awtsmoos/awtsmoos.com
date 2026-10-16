// B"H
// Boruch Hashem
// Blessed is He
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");

/**
 * Separate client and device credentials keep a stolen polling agent credential
 * from granting authority to enqueue commands on other devices. No hard-coded key.
 */
function configuredKey(role) {
  const name = role === "agent" ? "AGENT" : "CLIENT";
  const path = process.env[`AWTSMOOS_SIMPLE_TUNNEL_${name}_KEY_FILE`];
  let raw = "";
  try { if (path) raw = fs.readFileSync(path, "utf8").trim(); }
  catch { return ""; }
  if (!raw) raw = String(process.env[`AWTSMOOS_SIMPLE_TUNNEL_${name}_KEY`] || "").trim();
  return raw.length >= 32 ? raw : "";
}

function agentKeyFor(masterKey, id) {
  if (!/^[a-zA-Z0-9._-]{1,100}$/.test(String(id || "")) || !masterKey) return "";
  return crypto.createHmac("sha256", masterKey).update(`awtsmoos-simple-agent:${id}`).digest("hex");
}

function safeEquals(value, expected) {
  const candidate = Buffer.from(String(value || ""));
  const configured = Buffer.from(String(expected || ""));
  return configured.length >= 32 && candidate.length === configured.length &&
    crypto.timingSafeEqual(candidate, configured);
}

/** GET-only clients can sign URLs without sending their long-lived key in logs. */
function signature(key, purpose, fields = {}) {
  const digest = crypto.createHash("sha256").update(String(fields.command || "")).digest("hex");
  const canonical = [purpose, String(fields.agentId || ""), String(fields.id || ""),
    digest, String(fields.expires || ""), String(fields.nonce || "")].join("\n");
  return crypto.createHmac("sha256", key).update(canonical).digest("hex");
}

function authorization($i, role, purpose, fields = {}) {
  const master = configuredKey(role);
  const key = role === "agent" ? agentKeyFor(master, fields.agentId) : master;
  if (!master) return { ok: false, error: "simple_tunnel_not_configured", status: 503 };
  const query = $i.paramKinds?.GET || $i.$_GET || {};
  const body = fields.body || {};
  const headers = $i.request?.headers || {};
  const direct = role === "agent"
    ? headers["x-awtsmoos-simple-agent-key"] || body.agentKey
    : headers["x-awtsmoos-simple-client-key"] || body.clientKey || body.secret || query.secret;
  if (safeEquals(direct, key)) return { ok: true, mechanism: "header-or-legacy" };
  if (role !== "client" || !$i.request || !["GET", "HEAD"].includes(String($i.request.method || "GET").toUpperCase())) {
    return { ok: false, status: 403, error: "simple_tunnel_permission_denied" };
  }
  const expires = Number(query.expires);
  const nonce = String(query.nonce || "");
  const supplied = String(query.sig || "");
  if (!Number.isSafeInteger(expires) || expires < Date.now() || expires > Date.now() + 300_000 ||
    !/^[A-Za-z0-9_-]{16,96}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(supplied)) {
    return { ok: false, status: 403, error: "simple_tunnel_invalid_signature" };
  }
  const expected = signature(key, purpose, {
    agentId: fields.agentId, id: fields.id, command: fields.command,
    expires: query.expires, nonce
  });
  if (!safeEquals(supplied, expected)) {
    return { ok: false, status: 403, error: "simple_tunnel_invalid_signature" };
  }
  return { ok: true, mechanism: "signed-url", nonce, expires };
}

module.exports = { agentKeyFor, authorization, configuredKey, safeEquals, signature };
