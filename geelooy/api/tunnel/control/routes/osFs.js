// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { buildFsPayload, actionRequiredScope } = require("../core/tunnelPayload.js");
const { scopeAllowed, enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");
const { attachActionGuidance } = require("../core/actionGuidance.js");
const { sendVirtualOs } = require("./fsVessel/virtualClient.js");
const { routeHints, withRouteHints } = require("./fsVessel/queryHints.js");
const { VIRTUAL_OS_TUNNEL_NAME } = require("./fsVessel/virtualNames.js");

function responseBytes(obj) {
  try { return Buffer.byteLength(JSON.stringify(obj), "utf8"); }
  catch (_e) { return 0; }
}

function identityAllows(ident, neededScope) {
  if (ident.kind === "session") return true;
  return scopeAllowed(ident, neededScope) ||
    scopeAllowed(ident, "tunnel.admin") ||
    scopeAllowed(ident, "awtsmoos.os");
}

/**
 * B"H
 * Chapter 7: The old Awtsmoos OS route became the same virtual vessel.
 *
 * This compatibility route preserves `/fs/awtsmoos-os` while annotating the
 * payload exactly like the new `/fs/awtsmoos-virtual-os` route.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {Promise<void>} JSON response.
 */
async function osFs($i) {
  const ident = currentIdentity($i);
  const payload = withRouteHints(buildFsPayload($i), routeHints($i));
  payload.tunnelName = VIRTUAL_OS_TUNNEL_NAME;
  payload.targetVessel = "virtual-os";

  if (!ident.ok) {
    return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: "not_authenticated" }, payload), 401);
  }

  const neededScope = actionRequiredScope(payload.action);
  if (!identityAllows(ident, neededScope)) {
    return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: "missing_scope", neededScope }, payload), 403);
  }

  const rate = enforceApiKeyRate(ident, 0);
  if (!rate.ok) {
    return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: rate.error, limit: rate.limit }, payload), 429);
  }

  try {
    const result = attachActionGuidance(await sendVirtualOs($i, ident.userId, payload), payload);
    recordOsUsage(ident, payload, result, result.ok !== false);
    return json($i, result, result.status || 200);
  } catch (e) {
    const failure = attachActionGuidance({
      BH: "B\"H",
      ok: false,
      error: "awtsmoos_os_unavailable",
      message: e.message,
      aliasId: e.aliasId || null
    }, payload);
    recordOsUsage(ident, payload, failure, false);
    return json($i, failure, e.status || 503);
  }
}

function recordOsUsage(ident, payload, result, ok) {
  recordUsage({
    userId: ident.userId,
    keyId: ident.keyId || null,
    action: `${VIRTUAL_OS_TUNNEL_NAME}:${payload.action}`,
    path: payload.path,
    bytes: responseBytes(result),
    ok
  });
}

module.exports = { osFs };
