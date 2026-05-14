
// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { buildFsPayload, actionNeedsWrite } = require("../core/tunnelPayload.js");
const {
  scopeAllowed,
  enforceApiKeyRate
} = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");

function responseBytes(obj) {
  try {
    return Buffer.byteLength(JSON.stringify(obj));
  } catch (e) {
    return 0;
  }
}

/**
 * B"H
 * Protected tunnel filesystem endpoint.
 *
 * /api/tunnel/control/fs/:tunnelName?action=list&p=.
 *
 * Accepts session login, OAuth Bearer token, or Awtsmoos API key.
 * This does not yet enforce ownership of device by account. That comes with
 * pairing. But it already gives us scopes, rate-limit hooks, and usage logs.
 */
async function protectedFs($i, vars) {
  const ident = currentIdentity($i);

  if (!ident.ok) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: ident.error
    }, 401);
  }

  const payload = buildFsPayload($i);
  const neededScope = actionNeedsWrite(payload.action)
    ? "tunnel.write"
    : "tunnel.read";

  if (!scopeAllowed(ident, neededScope)) {
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
      path: payload.path,
      bytes,
      ok: result.ok !== false
    });

    return json($i, result, result.status || 200);
  } catch (e) {
    recordUsage({
      userId: ident.userId,
      keyId: ident.keyId || null,
      action: payload.action,
      path: payload.path,
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
