// B"H
const { currentIdentity } = require("../core/auth.js");
const { scopeAllowed, enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { text, json } = require("../core/respond.js");
const { recordUsage } = require("../core/usageStore.js");
const { boundedTunnelTimeout } = require("./protectedFs.js");

function from64(value) {
  if (!value) return "";
  return Buffer.from(String(value), "base64").toString("utf8");
}

function query($i) {
  return $i.paramKinds?.GET || $i.$_GET || {};
}

function identityAllows(ident) {
  if (ident.kind === "session") return true;
  return scopeAllowed(ident, "tunnel.read") || scopeAllowed(ident, "tunnel.admin");
}

/**
 * B"H
 * Authenticated pretty preview proxy.
 *
 * GET /api/tunnel/control/preview/{tunnelName}?url64=<base64 local url>
 *
 * This creates a browser-openable route for generated previews while preserving
 * tunnel authentication and local-agent mediation.
 */
async function previewProxy($i, vars) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
  if (!identityAllows(ident)) return json($i, { BH: "B\"H", ok: false, error: "missing_scope", neededScope: "tunnel.read" }, 403);

  const rate = enforceApiKeyRate(ident, 0);
  if (!rate.ok) return json($i, { BH: "B\"H", ok: false, error: rate.error, limit: rate.limit }, 429);

  const q = query($i);
  const url = q.url || from64(q.url64);
  if (!url) return json($i, { BH: "B\"H", ok: false, error: "missing_url", hint: "Pass url or url64." }, 400);

  const payload = {
    kind: "fs",
    action: "httpRequest",
    url,
    method: "GET",
    maxChars: Number(q.maxChars || 500000),
    timeoutMs: Number(q.timeoutMs || 30000),
    responseBodyMode: "text"
  };

  try {
    const result = await $i.ws.sendTunnelRequest(vars.tunnelName, payload, boundedTunnelTimeout(payload.timeoutMs));
    recordUsage({
      userId: ident.userId,
      keyId: ident.keyId || null,
      action: "previewProxy",
      path: url,
      bytes: Buffer.byteLength(String(result.body || result.content || ""), "utf8"),
      ok: result.ok !== false
    });

    if (result.ok === false) return json($i, result, result.status || 502);

    const body = result.body || result.content || result.text || "";
    const mime = result.contentType || result.headers?.["content-type"] || "text/html; charset=utf-8";
    return text($i, body, mime, result.status || 200);
  } catch (e) {
    recordUsage({ userId: ident.userId, keyId: ident.keyId || null, action: "previewProxy", path: url, ok: false });
    return json($i, { BH: "B\"H", ok: false, error: e.message, stack: e.stack }, 500);
  }
}

module.exports = { previewProxy };
