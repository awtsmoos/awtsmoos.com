
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
 * These actions are allowed from a normal logged-in browser session because
 * they power the hosted control panel itself. They still require the user to be
 * logged in. They do NOT expose arbitrary file contents.
 */
const SESSION_SAFE_ACTIONS = new Set([
  "configGet",
  "configSet",
  "roots",
  "rootBrowse",
  "rootSelect",
  "openRoot"
]);

function mayUseSessionForDashboard(payload) {
  return SESSION_SAFE_ACTIONS.has(payload.action);
}

/**
 * B"H
 * Protected tunnel filesystem endpoint.
 *
 * Browser session:
 * - allowed for dashboard setup/root picker/config actions only
 *
 * API key or OAuth:
 * - required for list/tree/read/write/bulk file actions
 */
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
      details: "For file listing/reading/writing, create or paste an API key in the dashboard first. Setup actions like root picker are allowed with browser login."
    }, 401);
  }

  const neededScope = actionNeedsWrite(payload.action)
    ? "tunnel.write"
    : "tunnel.read";

  if (ident.kind !== "session" && !scopeAllowed(ident, neededScope)) {
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
      path: payload.path || payload.absolutePath || null,
      bytes,
      ok: result.ok !== false
    });

    return json($i, result, result.status || 200);
  } catch (e) {
    recordUsage({
      userId: ident.userId,
      keyId: ident.keyId || null,
      action: payload.action,
      path: payload.path || payload.absolutePath || null,
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
