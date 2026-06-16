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
 * Chapter 21: The gate received hidden carriers.
 * GPT Actions can carry full trees/jobs inside params/params64 because the
 * visible schema cannot model every nested object.
 *
 * Chapter 460: A wandering agent brought `action=bulk` with an `actionsJson`
 * bundle of writes. The old river thought bulk meant only bulk-read. The new
 * river recognizes the living intention: arrays of action objects are action
 * batches, while ordinary bulk file lists remain untouched.
 */
function responseBytes(obj) { try { return Buffer.byteLength(JSON.stringify(obj), "utf8"); } catch (_e) { return 0; } }
function identityAllows(ident, neededScope) { if (ident.kind === "session") return true; return scopeAllowed(ident, neededScope) || scopeAllowed(ident, "tunnel.admin") || scopeAllowed(ident, "awtsmoos.os"); }
function boundedTunnelTimeout(value) {
  const n = Number(value || FOUR_MINUTES_MS);
  if (!Number.isFinite(n)) return FOUR_MINUTES_MS;
  const normalized = Math.floor(n);
  if (normalized < MIN_TIMEOUT_MS) return MIN_TIMEOUT_MS;
  if (normalized > ONE_DAY_MS) { const error = new Error(`timeout_too_large: requested ${normalized}ms, maximum ${ONE_DAY_MS}ms`); error.status = 400; error.maxTimeoutMs = ONE_DAY_MS; throw error; }
  return normalized;
}

async function protectedFs($i, vars) {
  const ident = currentIdentity($i);
  const rawPayload = normalizeCarriers(buildFsPayload($i), $i);
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
  try { requestTimeoutMs = boundedTunnelTimeout(payload.timeoutMs); } catch (error) { return timeoutFailure($i, payload, error); }
  const affordability = canAfford(ident.userId, payload);
  if (!affordability.ok) return insufficientPerutas($i, payload, affordability);
  const vessel = resolveFsVessel({ $i, userId: ident.userId, tunnelName, payload, timeoutMs: requestTimeoutMs });
  return await runResolvedVessel($i, ident, payload, vessel, affordability);
}

function normalizeCarriers(payload = {}, $i = {}) {
  const merged = { ...payload };
  const query = $i.paramKinds?.GET || $i.$_GET || {};
  const body = $i.paramKinds?.POST || {};
  mergeObject(merged, parseCarrier(payload.params, {}));
  mergeObject(merged, parseCarrier(query.params, {}));
  mergeObject(merged, parseCarrier(body.params, {}));
  mergeObject(merged, parse64(query.params64 || body.params64 || payload.params64, {}));
  for (const key of ["tree", "vars", "steps", "actions", "commandTree", "workflow"]) {
    const value = firstDefined(payload[key], query[key], body[key]);
    if (value !== undefined && value !== "") merged[key] = parseCarrier(value, value);
    const encoded = firstDefined(payload[key + "64"], query[key + "64"], body[key + "64"]);
    if (encoded) merged[key] = parse64(encoded, merged[key]);
  }
  for (const key of ["outputId", "outputRef", "resultId", "resultRef", "jobId", "stream", "pageToken", "cursorToken", "maxInlineChars", "pageChars", "async", "asyncCommand", "background"]) {
    const value = firstDefined(payload[key], query[key], body[key]);
    if (value !== undefined && value !== "") merged[key] = value;
  }
  hydrateActionStepsFromActionsJson(merged);
  return merged;
}

function hydrateActionStepsFromActionsJson(merged) {
  const actionJson = parseCarrier(merged.actionsJson, null);
  if (!actionJson) return merged;
  if (isLegacyBulkActionBatch(merged.action, actionJson, merged)) {
    merged.action = "actionBatch";
    merged.compatibilityAlias = "bulk_actionsJson_to_actionBatch";
  }
  if (isBatchLikeAction(merged.action)) hydrateBatchLikePayload(merged, actionJson);
  if (isCommandTree(merged.action)) hydrateCommandTreePayload(merged, actionJson);
  return merged;
}

function hydrateBatchLikePayload(merged, actionJson) {
  const steps = stepsFromCarrier(actionJson);
  if (steps.length && (!Array.isArray(merged.steps) || !merged.steps.length)) merged.steps = steps;
  if (steps.length && (!Array.isArray(merged.actions) || !merged.actions.length)) merged.actions = steps;
  if (actionJson && typeof actionJson === "object" && !Array.isArray(actionJson)) {
    if (actionJson.workflow && !merged.workflow) merged.workflow = actionJson.workflow;
    if (actionJson.vars && !merged.vars) merged.vars = actionJson.vars;
  }
}

function hydrateCommandTreePayload(merged, actionJson) {
  if (!merged.tree && actionJson && typeof actionJson === "object") merged.tree = actionJson;
  const steps = stepsFromCarrier(actionJson);
  if ((!merged.steps || !merged.steps.length) && steps.length) merged.steps = steps;
  if (merged.tree && typeof merged.tree === "object") {
    if (merged.tree.vars && !merged.vars) merged.vars = merged.tree.vars;
    if (merged.tree.budgetPerutas && !merged.budgetPerutas) merged.budgetPerutas = merged.tree.budgetPerutas;
  }
}

function isLegacyBulkActionBatch(action, actionJson, merged) {
  const steps = stepsFromCarrier(actionJson);
  return String(action || "") === "bulk" && !merged.files && steps.length > 0 && steps.every(step => step && typeof step === "object" && step.action);
}

function isBatchLikeAction(action) {
  return /^(actionBatch|parallelActionBatch|forEachActionBatch|retryAction|assertAction|testMatrix|runtimeWorkflow|aiWorkflowRun)$/i.test(String(action || ""));
}

function stepsFromCarrier(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value.steps)) return value.steps;
  if (Array.isArray(value.actions)) return value.actions;
  if (Array.isArray(value.do)) return value.do;
  if (Array.isArray(value.workflow?.steps)) return value.workflow.steps;
  return [];
}

function controlBaseUrl(tunnelName) { return "https://awtsmoos.com/api/tunnel/control/fs/" + encodeURIComponent(tunnelName || "auto"); }
function authFailure($i, payload, ident) { return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: ident.error || "not_authenticated", guidance: "Log in normally, use OAuth Bearer token, or use x-awtsmoos-api-key." }, payload), 401); }
function scopeFailure($i, ident, payload) { const neededScope = actionRequiredScope(payload.action); if (identityAllows(ident, neededScope)) return null; return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: "missing_scope", neededScope, identityKind: ident.kind }, payload), 403); }
function rateFailure($i, payload, rate) { return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: rate.error, limit: rate.limit }, payload), 429); }
function timeoutFailure($i, payload, error) { return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: "timeout_too_large", message: error.message, maxTimeoutMs: error.maxTimeoutMs || ONE_DAY_MS, guidance: "Use a smaller timeout, split into a workflow, or let the AI cancel explicitly when the command has produced enough output." }, payload), error.status || 400); }
function insufficientPerutas($i, payload, affordability) { return json($i, attachActionGuidance({ BH: "B\"H", ok: false, status: 402, error: "insufficient_perutas", requiredPerutas: affordability.estimatedPerutas, balance: affordability.balance, shortfall: affordability.shortfall, purchaseUrl: affordability.purchaseUrl, aiSystemMessage: affordability.messageForAi, guidance: affordability.messageForAi }, payload), 402); }
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
function maybeAttachAccountSave(ident, payload, result) { if (payload.action !== "aiAgentSetProviderKey") return result; if (!shouldSaveRemote(payload)) return result; const accountProviderKey = saveAccountProviderKey(ident.userId, payload); return { ...result, accountProviderKey }; }
function recordFsUsage(ident, payload, result, ok, durationMs) { const bytes = responseBytes(result); const entry = { userId: ident.userId, keyId: ident.keyId || null, action: `${payload.tunnelName || "auto"}:${payload.action}`, path: payload.path || payload.absolutePath || payload.cwd || payload.url || null, bytes, files: result.returnedCount || result.returnedResults || result.returnedRows || result.count || 0, seconds: Math.max(0, Number(durationMs || 0) / 1000), ok }; recordUsage(entry); const peruta = chargeUsage(entry); result.peruta = peruta; result.usage = usageSummary(ident.userId); }
function parseCarrier(value, fallback = {}) { if (value === undefined || value === null || value === "") return fallback; if (typeof value === "object") return value; try { return JSON.parse(String(value)); } catch (_) { return fallback === undefined ? value : fallback; } }
function parse64(value, fallback = {}) { if (!value) return fallback; try { return JSON.parse(Buffer.from(String(value), "base64").toString("utf8")); } catch (_) { return fallback; } }
function firstDefined(...values) { return values.find(value => value !== undefined && value !== null); }
function mergeObject(target, source) { if (!source || typeof source !== "object" || Array.isArray(source)) return target; for (const [key, value] of Object.entries(source)) if (value !== undefined) target[key] = value; return target; }
function isCommandTree(action) { return /commandTree|awtsmoosCommandTree|merkavaCommandTree/.test(String(action || "")); }

module.exports = { boundedTunnelTimeout, protectedFs, ONE_DAY_MS, normalizeCarriers };
