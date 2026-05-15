
// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { buildFsPayload, actionRequiredScope } = require("../core/tunnelPayload.js");
const { scopeAllowed, enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");

function responseBytes(obj) {
  try { return Buffer.byteLength(JSON.stringify(obj), "utf8"); }
  catch (e) { return 0; }
}

function allowedByIdentity(ident, neededScope) {
  if (ident.kind === "session") return true;
  return scopeAllowed(ident, neededScope) || scopeAllowed(ident, "tunnel.admin");
}

async function protectedFs($i, vars) {
  const ident = currentIdentity($i);

  if (!ident.ok) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: ident.error || "not_authenticated",
      guidance: "Log in normally, reconnect OAuth, or use x-awtsmoos-api-key."
    }, 401);
  }

  const payload = buildFsPayload($i);
  const neededScope = actionRequiredScope(payload.action);

  if (!allowedByIdentity(ident, neededScope)) {
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
      stack: e.stack,
      guidance: "The website reached auth, but the tunnel agent did not answer in time. Make sure the local agent is running and connected."
    }, 500);
  }
}

module.exports = { protectedFs };
