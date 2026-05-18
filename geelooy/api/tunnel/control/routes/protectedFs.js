// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { buildFsPayload, actionRequiredScope } = require("../core/tunnelPayload.js");
const { scopeAllowed, enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");

const FOUR_MINUTES_MS = 240000;

function responseBytes(obj) {
  try { return Buffer.byteLength(JSON.stringify(obj), "utf8"); }
  catch (e) { return 0; }
}

function identityAllows(ident, neededScope) {
  if (ident.kind === "session") return true;
  return scopeAllowed(ident, neededScope) || scopeAllowed(ident, "tunnel.admin");
}

/**
 * B"H
 * Bounds public API waits to four minutes so slow local commands do not become false gateway failures.
 *
 * @param {$} value Requested timeout.
 * @returns {number} Bounded timeout.
 */
function boundedTunnelTimeout(value) {
  const n = Number(value || FOUR_MINUTES_MS);
  if (!Number.isFinite(n)) return FOUR_MINUTES_MS;
  return Math.max(1000, Math.min(Math.floor(n), FOUR_MINUTES_MS));
}

async function protectedFs($i, vars) {
  const ident = currentIdentity($i);

  if (!ident.ok) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: ident.error || "not_authenticated",
      guidance: "Log in normally, use OAuth Bearer token, or use x-awtsmoos-api-key."
    }, 401);
  }

  const payload = buildFsPayload($i);
  payload.tunnelName = vars.tunnelName;
  payload.controlBaseUrl = "https://awtsmoos.com/api/tunnel/control/fs/" + encodeURIComponent(vars.tunnelName);

  const neededScope = actionRequiredScope(payload.action);

  if (!identityAllows(ident, neededScope)) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "missing_scope",
      neededScope,
      identityKind: ident.kind
    }, 403);
  }

  const rate = enforceApiKeyRate(ident, 0);
  if (!rate.ok) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: rate.error,
      limit: rate.limit
    }, 429);
  }

  try {
    const requestTimeoutMs = boundedTunnelTimeout(payload.timeoutMs);
    const result = await $i.ws.sendTunnelRequest(vars.tunnelName, payload, requestTimeoutMs);
    const bytes = responseBytes(result);

    recordUsage({
      userId: ident.userId,
      keyId: ident.keyId || null,
      action: payload.action,
      path: payload.path || payload.absolutePath || payload.cwd || payload.url || null,
      bytes,
      ok: result.ok !== false
    });

    return json($i, result, result.status || 200);
  } catch (e) {
    recordUsage({
      userId: ident.userId,
      keyId: ident.keyId || null,
      action: payload.action,
      path: payload.path || payload.absolutePath || payload.cwd || payload.url || null,
      ok: false
    });

    return json($i, {
      BH: "B\"H",
      ok: false,
      error: e.message,
      stack: e.stack
    }, 500);
  }
}

module.exports = { protectedFs, boundedTunnelTimeout };
