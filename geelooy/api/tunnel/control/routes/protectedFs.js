// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { buildFsPayload, actionRequiredScope } = require("../core/tunnelPayload.js");
const { scopeAllowed, enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");
const { maybeExternalize } = require("../core/responseModes.js");
const { publishHandoff } = require("../core/handoffStore.js");
const { attachActionGuidance } = require("../core/actionGuidance.js");
const { saveAccountProviderKey, shouldSaveRemote } = require("../core/accountAiConfigStore.js");
const { resolveFsVessel } = require("./fsVessel/resolveFsVessel.js");
const { routeHints, withRouteHints } = require("./fsVessel/queryHints.js");

const FOUR_MINUTES_MS = 240000;

/**
 * B"H
 * Chapter 2: The gate learned the user's consent.
 *
 * Local tunnel actions remain local. Only when the payload explicitly says to
 * save a provider key to the Awtsmoos account does this route copy the key into
 * the hosted account store, after the local vessel answers. The response carries
 * a warning so the human sees the boundary: local disk is one chamber, remote
 * account storage is another.
 */
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

function boundedTunnelTimeout(value) {
  const n = Number(value || FOUR_MINUTES_MS);
  if (!Number.isFinite(n)) return FOUR_MINUTES_MS;
  return Math.max(1000, Math.min(Math.floor(n), FOUR_MINUTES_MS));
}

async function protectedFs($i, vars) {
  const ident = currentIdentity($i);
  const rawPayload = buildFsPayload($i);
  const hints = routeHints($i);
  const tunnelName = vars.tunnelName;
  const payload = withRouteHints(rawPayload, hints);
  payload.tunnelName = tunnelName;
  payload.controlBaseUrl = controlBaseUrl(tunnelName);

  if (!ident.ok) return authFailure($i, payload, ident);
  const denied = scopeFailure($i, ident, payload);
  if (denied) return denied;

  const rate = enforceApiKeyRate(ident, 0);
  if (!rate.ok) return rateFailure($i, payload, rate);

  const requestTimeoutMs = boundedTunnelTimeout(payload.timeoutMs);
  const vessel = resolveFsVessel({ $i, userId: ident.userId, tunnelName, payload, timeoutMs: requestTimeoutMs });
  return await runResolvedVessel($i, ident, payload, vessel);
}

function controlBaseUrl(tunnelName) {
  return "https://awtsmoos.com/api/tunnel/control/fs/" + encodeURIComponent(tunnelName || "auto");
}

function authFailure($i, payload, ident) {
  return json($i, attachActionGuidance({
    BH: "B\"H",
    ok: false,
    error: ident.error || "not_authenticated",
    guidance: "Log in normally, use OAuth Bearer token, or use x-awtsmoos-api-key."
  }, payload), 401);
}

function scopeFailure($i, ident, payload) {
  const neededScope = actionRequiredScope(payload.action);
  if (identityAllows(ident, neededScope)) return null;
  return json($i, attachActionGuidance({
    BH: "B\"H",
    ok: false,
    error: "missing_scope",
    neededScope,
    identityKind: ident.kind
  }, payload), 403);
}

function rateFailure($i, payload, rate) {
  return json($i, attachActionGuidance({
    BH: "B\"H",
    ok: false,
    error: rate.error,
    limit: rate.limit
  }, payload), 429);
}

async function runResolvedVessel($i, ident, payload, vessel) {
  try {
    const result = await vessel.send();
    const withAccount = maybeAttachAccountSave(ident, payload, result);
    publishHandoff(vessel.tunnelName || payload.tunnelName, { action: payload.action, result: withAccount });
    const shaped = attachActionGuidance(maybeExternalize(withAccount, payload), payload);
    recordFsUsage(ident, payload, shaped, result.ok !== false);
    return json($i, shaped, shaped.status || result.status || 200);
  } catch (e) {
    const failure = attachActionGuidance({ BH: "B\"H", ok: false, error: e.message, stack: e.stack }, payload);
    recordFsUsage(ident, payload, failure, false);
    publishHandoff(payload.tunnelName, { action: payload.action, result: failure });
    return json($i, failure, 500);
  }
}

function maybeAttachAccountSave(ident, payload, result) {
  if (payload.action !== "aiAgentSetProviderKey") return result;
  if (!shouldSaveRemote(payload)) return result;
  const accountProviderKey = saveAccountProviderKey(ident.userId, payload);
  return { ...result, accountProviderKey };
}

function recordFsUsage(ident, payload, result, ok) {
  recordUsage({
    userId: ident.userId,
    keyId: ident.keyId || null,
    action: `${payload.tunnelName || "auto"}:${payload.action}`,
    path: payload.path || payload.absolutePath || payload.cwd || payload.url || null,
    bytes: responseBytes(result),
    ok
  });
}

module.exports = { boundedTunnelTimeout, protectedFs };
