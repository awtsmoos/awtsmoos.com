
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

function query($i) {
  return $i.paramKinds?.GET || $i.$_GET || {};
}

/**
 * B"H
 * Protected tunnel filesystem endpoint.
 *
 * Security mode:
 * - OAuth bearer token is allowed.
 * - Awtsmoos API key is allowed.
 * - Browser session alone is NOT allowed unless debug=1 is explicitly passed.
 *
 * This prevents a raw URL from working merely because someone has a browser
 * session. The hosted control panel should create/select an API key, then send
 * it as x-awtsmoos-api-key.
 */
async function protectedFs($i, vars) {
  const q = query($i);
  const ident = currentIdentity($i);
  const debugSessionAllowed = q.debug === "1" || q.debug === "true";

  if (!ident.ok) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: ident.error || "not_authenticated",
      help: "Use OAuth Bearer token or x-awtsmoos-api-key."
    }, 401);
  }

  if (ident.kind === "session" && !debugSessionAllowed) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "api_key_or_oauth_required",
      details: "Session login can create API keys, but tunnel filesystem calls require an API key or OAuth bearer token unless debug=1 is passed."
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
