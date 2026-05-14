
// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { buildFsPayload, actionRequiredScope } = require("../core/tunnelPayload.js");
const { scopeAllowed, enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");

function responseBytes(obj) {
  try {
    return Buffer.byteLength(JSON.stringify(obj), "utf8");
  } catch (e) {
    return 0;
  }
}

const SESSION_SAFE_ACTIONS = new Set([
  "configGet",
  "configSet",
  "roots",
  "rootBrowse",
  "rootSelect",
  "openRoot",
  "chromeFind",
  "chromeStatus"
]);

function mayUseSessionForDashboard(payload) {
  return SESSION_SAFE_ACTIONS.has(payload.action);
}

async function protectedFs($i, vars) {
  const ident = currentIdentity($i);

  if (!ident.ok) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: ident.error || "not_authenticated",
      help: "Log in, use OAuth Bearer token, or use x-awtsmoos-api-key."
    }, 401);
  }

  const payload = buildFsPayload($i);

  if (ident.kind === "session" && !mayUseSessionForDashboard(payload)) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "api_key_or_oauth_required",
      details: "Setup, root picker, Chrome find, and Chrome status may use browser login. File, terminal, write, and Chrome control actions require x-awtsmoos-api-key or OAuth.",
      neededScope: actionRequiredScope(payload.action)
    }, 401);
  }

  const neededScope = actionRequiredScope(payload.action);

  if (ident.kind !== "session" && !scopeAllowed(ident, neededScope) && !scopeAllowed(ident, "tunnel.admin")) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "missing_scope",
      neededScope
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
    const result = await $i.ws.sendTunnelRequest(vars.tunnelName, payload);
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

module.exports = { protectedFs };
