// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { buildFsPayload, actionRequiredScope } = require("../core/tunnelPayload.js");
const { scopeAllowed, enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { canAfford, chargeUsage, recordUsage, usageSummary } = require("../core/usageStore.js");
const { maybeExternalize } = require("../core/responseModes.js");
const { publishHandoff } = require("../core/handoffStore.js");
const { attachActionGuidance } = require("../core/actionGuidance.js");
const { saveAccountProviderKey, shouldSaveRemote } = require("../core/accountAiConfigStore.js");
const { resolveFsVessel } = require("./fsVessel/resolveFsVessel.js");
const { routeHints, withRouteHints } = require("./fsVessel/queryHints.js");

const FOUR_MINUTES_MS = 240000;
const ONE_DAY_MS = 86400000;
const MIN_TIMEOUT_MS = 1000;

/**
 * B"H
 * Chapter 20: The gate asks the wallet, not the panic clock.
 *
 * The tunnel accepts giant scopes and long commands, estimates their peruta
 * cost, and refuses only when the account cannot pay. If refused, the response
 * shouts a clear all-caps message to the AI and points to awtsmoos.com/compute.
 */
function responseBytes(obj) {
  try { return Buffer.byteLength(JSON.stringify(obj), "utf8"); }
  catch (_e) { return 0; }
}

function identityAllows(ident, neededScope) {
  if (ident.kind === "session") return true;
  return scopeAllowed(ident, neededScope) || scopeAllowed(ident, "tunnel.admin") || scopeAllowed(ident, "awtsmoos.os");
}

function boundedTunnelTimeout(value) {
  const n = Number(value || FOUR_MINUTES_MS);
  if (!Number.isFinite(n)) return FOUR_MINUTES_MS;
  const normalized = Math.floor(n);
  if (normalized < MIN_TIMEOUT_MS) return MIN_TIMEOUT_MS;
  if (normalized > ONE_DAY_MS) {
    const error = new Error(`timeout_too_large: requested ${normalized}ms, maximum ${ONE_DAY_MS}ms`);
    error.status = 400;
    error.maxTimeoutMs = ONE_DAY_MS;
    throw error;
  }
  return normalized;
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

  let requestTimeoutMs;
  try { requestTimeoutMs = boundedTunnelTimeout(payload.timeoutMs); }
  catch (error) { return timeoutFailure($i, payload, error); }

  const affordability = canAfford(ident.userId, payload);
  if (!affordability.ok) return insufficientPerutas($i, payload, affordability);

  const vessel = resolveFsVessel({ $i, userId: ident.userId, tunnelName, payload, timeoutMs: requestTimeoutMs });
  return await runResolvedVessel($i, ident, payload, vessel, affordability);
}

function controlBaseUrl(tunnelName) {
  return "https://awtsmoos.com/api/tunnel/control/fs/" + encodeURIComponent(tunnelName || "auto");
}

function authFailure($i, payload, ident) {
  return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: ident.error || "not_authenticated", guidance: "Log in normally, use OAuth Bearer token, or use x-awtsmoos-api-key." }, payload), 401);
}

function scopeFailure($i, ident, payload) {
  const neededScope = actionRequiredScope(payload.action);
  if (identityAllows(ident, neededScope)) return null;
  return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: "missing_scope", neededScope, identityKind: ident.kind }, payload), 403);
}

function rateFailure($i, payload, rate) {
  return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: rate.error, limit: rate.limit }, payload), 429);
}

function timeoutFailure($i, payload, error) {
  return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: "timeout_too_large", message: error.message, maxTimeoutMs: error.maxTimeoutMs || ONE_DAY_MS, guidance: "Use a smaller timeout, split into a workflow, or let the AI cancel explicitly when the command has produced enough output." }, payload), error.status || 400);
}

function insufficientPerutas($i, payload, affordability) {
  return json($i, attachActionGuidance({
    BH: "B\"H",
    ok: false,
    status: 402,
    error: "insufficient_perutas",
    requiredPerutas: affordability.estimatedPerutas,
    balance: affordability.balance,
    shortfall: affordability.shortfall,
    purchaseUrl: affordability.purchaseUrl,
    aiSystemMessage: affordability.messageForAi,
    guidance: affordability.messageForAi
  }, payload), 402);
}

async function runResolvedVessel($i, ident, payload, vessel, affordability) {
  try {
    const started = Date.now();
    const result = await vessel.send();
    const withAccount = maybeAttachAccountSave(ident, payload, result);
    withAccount.estimatedPerutas = affordability.estimatedPerutas;
    withAccount.estimatedBytes = affordability.estimatedBytes;
    withAccount.estimatedFiles = affordability.estimatedFiles;
    withAccount.estimatedSeconds = affordability.estimatedSeconds;
    publishHandoff(vessel.tunnelName || payload.tunnelName, { action: payload.action, result: withAccount });
    const shaped = attachActionGuidance(maybeExternalize(withAccount, payload), payload);
    recordFsUsage(ident, payload, shaped, result.ok !== false, Date.now() - started);
    return json($i, shaped, shaped.status || result.status || 200);
  } catch (e) {
    const failure = attachActionGuidance({ BH: "B\"H", ok: false, error: e.message, stack: e.stack }, payload);
    recordFsUsage(ident, payload, failure, false, 0);
    publishHandoff(payload.tunnelName, { action: payload.action, result: failure });
    return json($i, failure, e.status || 500);
  }
}

function maybeAttachAccountSave(ident, payload, result) {
  if (payload.action !== "aiAgentSetProviderKey") return result;
  if (!shouldSaveRemote(payload)) return result;
  const accountProviderKey = saveAccountProviderKey(ident.userId, payload);
  return { ...result, accountProviderKey };
}

function recordFsUsage(ident, payload, result, ok, durationMs) {
  const bytes = responseBytes(result);
  const entry = {
    userId: ident.userId,
    keyId: ident.keyId || null,
    action: `${payload.tunnelName || "auto"}:${payload.action}`,
    path: payload.path || payload.absolutePath || payload.cwd || payload.url || null,
    bytes,
    files: result.returnedCount || result.returnedResults || result.returnedRows || result.count || 0,
    seconds: Math.max(0, Number(durationMs || 0) / 1000),
    ok
  };
  recordUsage(entry);
  const peruta = chargeUsage(entry);
  result.peruta = peruta;
  result.usage = usageSummary(ident.userId);
}

module.exports = { boundedTunnelTimeout, protectedFs, ONE_DAY_MS };
