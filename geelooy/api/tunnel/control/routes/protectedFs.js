// B"H
const crypto = require("crypto");
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { buildFsPayload, actionRequiredScope } = require("../core/tunnelPayload.js");
const { scopeAllowed, enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { canAfford, chargeUsage, recordUsage } = require("../core/usageStore.js");
const { maybeExternalize } = require("../core/responseModes.js");
const { publishHandoff } = require("../core/handoffStore.js");
const { attachActionGuidance } = require("../core/actionGuidance.js");
const { pruneTunnelResponse } = require("../core/responsePruner.js");
const { enforceProtocolGate } = require("../core/protocolGateStore.js");
const { saveAccountProviderKey, shouldSaveRemote } = require("../core/accountAiConfigStore.js");
const { resolveFsVessel } = require("./fsVessel/resolveFsVessel.js");
const { routeHints, withRouteHints } = require("./fsVessel/queryHints.js");
const { autoCreatePreviewResult } = require("../preview/previewAutoCreate.js");
const { ensureConversation, recordConversationEvent } = require("../core/conversationStore.js");
const { applyRoutePreference, rememberRoutePreference } = require("../core/routePreferenceStore.js");
const { normalizeAsyncPayload } = require("../core/asyncPayloadNormalizer.js");

const FOUR_MINUTES_MS = 240000, ONE_DAY_MS = 86400000, MIN_TIMEOUT_MS = 1000;
function responseBytes(obj) { try { return Buffer.byteLength(JSON.stringify(obj), "utf8"); } catch { return 0; } }
function identityAllows(ident, scope) { return ident.kind === "session" || scopeAllowed(ident, scope) || scopeAllowed(ident, "tunnel.admin") || scopeAllowed(ident, "awtsmoos.os"); }
function boundedTunnelTimeout(value) { const n = Number(value || FOUR_MINUTES_MS); if (!Number.isFinite(n)) return FOUR_MINUTES_MS; const x = Math.floor(n); if (x < MIN_TIMEOUT_MS) return MIN_TIMEOUT_MS; if (x > ONE_DAY_MS) { const e = new Error(`timeout_too_large: requested ${x}ms, maximum ${ONE_DAY_MS}ms`); e.status = 400; e.maxTimeoutMs = ONE_DAY_MS; throw e; } return x; }
async function protectedFs($i, vars) {
  const ident = currentIdentity($i), rawPayload = normalizeCarriers(buildFsPayload($i), $i), requestedTunnelName = vars.tunnelName;
  const payload = withRouteHints(rawPayload, routeHints($i)); payload.tunnelName = requestedTunnelName; payload.controlBaseUrl = controlBaseUrl(requestedTunnelName);
  if (!ident.ok) return authFailure($i, payload, ident); const denied = scopeFailure($i, ident, payload); if (denied) return denied;
  const rate = enforceApiKeyRate(ident, 0); if (!rate.ok) return rateFailure($i, payload, rate); let requestTimeoutMs;
  try { requestTimeoutMs = boundedTunnelTimeout(payload.timeoutMs); } catch (error) { return timeoutFailure($i, payload, error); }
  const affordability = canAfford(ident.userId, payload); if (!affordability.ok) return insufficientPerutas($i, payload, affordability);
  const conversation = ensureConversation(ident.userId, payload); payload.conversationId = conversation.id; payload.conversationName = conversation.name;
  const route = applyRoutePreference(ident.userId, conversation.id, requestedTunnelName, payload), tunnelName = route.tunnelName;
  payload.requestedTunnelName = requestedTunnelName || tunnelName; payload.tunnelName = tunnelName; attachCorrelation(payload, ident, tunnelName); if (route.sticky) payload.stickyRoute = route.sticky;
  if (payload.asyncPayloadError) return json($i, pruneTunnelResponse(payload.asyncPayloadError, payload), 400);
  const blocked = enforceProtocolGate(payload); if (blocked) return json($i, pruneTunnelResponse(blocked, payload), blocked.status || 409);
  const vessel = resolveFsVessel({ $i, userId: ident.userId, tunnelName, payload, timeoutMs: requestTimeoutMs });
  return await runResolvedVessel($i, ident, payload, vessel, affordability);
}
function normalizeCarriers(payload = {}, $i = {}) {
  const merged = { ...payload }, query = $i.paramKinds?.GET || $i.$_GET || {}, body = $i.paramKinds?.POST || {};
  const originalAction = merged.action;
  const carriers = [parseCarrier(payload.params, {}), parseCarrier(query.params, {}), parseCarrier(body.params, {}), parse64(query.params64 || body.params64 || payload.params64, {})];
  for (const carrier of carriers) mergeObject(merged, carrier);
  const intendedAction = firstExplicitAction(carriers, payload, query, body);
  if (intendedAction && intendedAction !== originalAction) {
    merged.adapterAction = originalAction;
    merged.action = intendedAction;
    merged.actionRecoveredFromCarrier = true;
    merged.kind = recoveredKindForAction(intendedAction, merged.kind);
  }
  for (const key of ["tree", "vars", "steps", "actions", "commandTree", "workflow"]) {
    const value = firstDefined(payload[key], query[key], body[key]);
    if (value !== undefined && value !== "") merged[key] = parseCarrier(value, value);
    const encoded = firstDefined(payload[key + "64"], query[key + "64"], body[key + "64"]);
    if (encoded) merged[key] = parse64(encoded, merged[key]);
  }
  for (const key of ["outputId", "outputRef", "resultId", "resultRef", "jobId", "stream", "pageToken", "cursorToken", "maxInlineChars", "pageChars", "async", "asyncCommand", "background", "continuationPrompt", "multipleChoiceAnswer", "choice", "answer", "intendedAction", "expectedAction"]) {
    const value = firstDefined(payload[key], query[key], body[key]);
    if (value !== undefined && value !== "") merged[key] = value;
  }
  hydrateActionStepsFromActionsJson(merged);
  normalizeAsyncPayload(merged);
  return merged;
}

function firstExplicitAction(carriers, payload = {}, query = {}, body = {}) {
  for (const source of carriers) {
    if (!source || typeof source !== "object" || Array.isArray(source)) continue;
    const value = source.intendedAction || source.expectedAction || source.action;
    if (validActionCarrier(value)) return String(value);
  }
  const value = firstDefined(payload.intendedAction, payload.expectedAction, query.intendedAction, query.expectedAction, body.intendedAction, body.expectedAction);
  return validActionCarrier(value) ? String(value) : "";
}
function validActionCarrier(value) { return typeof value === "string" && /^[A-Za-z][A-Za-z0-9]*$/.test(value); }
function recoveredKindForAction(action, fallback) {
  const text = String(action || "");
  if (text.startsWith("command") || text === "command" || text === "nodeScriptRun" || text === "nodeCheck" || text === "nodeCheckTree") return "command";
  if (text.startsWith("chrome")) return "chrome";
  return fallback || "fs";
}
function hydrateActionStepsFromActionsJson(merged) { const actionJson = parseCarrier(merged.actionsJson, null); if (!actionJson) return merged; if (isLegacyBulkActionBatch(merged.action, actionJson, merged)) { merged.action = "actionBatch"; merged.compatibilityAlias = "bulk_actionsJson_to_actionBatch"; } if (isBatchLikeAction(merged.action)) hydrateBatchLikePayload(merged, actionJson); if (isCommandTree(merged.action)) hydrateCommandTreePayload(merged, actionJson); return merged; }
function hydrateBatchLikePayload(merged, actionJson) { const steps = stepsFromCarrier(actionJson); if (steps.length && (!Array.isArray(merged.steps) || !merged.steps.length)) merged.steps = steps; if (steps.length && (!Array.isArray(merged.actions) || !merged.actions.length)) merged.actions = steps; if (actionJson && typeof actionJson === "object" && !Array.isArray(actionJson)) { if (actionJson.workflow && !merged.workflow) merged.workflow = actionJson.workflow; if (actionJson.vars && !merged.vars) merged.vars = actionJson.vars; } }
function hydrateCommandTreePayload(merged, actionJson) { if (!merged.tree && actionJson && typeof actionJson === "object") merged.tree = actionJson; const steps = stepsFromCarrier(actionJson); if ((!merged.steps || !merged.steps.length) && steps.length) merged.steps = steps; if (merged.tree && typeof merged.tree === "object") { if (merged.tree.vars && !merged.vars) merged.vars = merged.tree.vars; if (merged.tree.budgetPerutas && !merged.budgetPerutas) merged.budgetPerutas = merged.tree.budgetPerutas; } }
function isLegacyBulkActionBatch(action, actionJson, merged) { const steps = stepsFromCarrier(actionJson); return String(action || "") === "bulk" && !merged.files && steps.length > 0 && steps.every(step => step && typeof step === "object" && step.action); }
function isBatchLikeAction(action) { return /^(actionBatch|commandBatch|aiCommandBatch|parallelActionBatch|forEachActionBatch|retryAction|assertAction|testMatrix|runtimeWorkflow|aiWorkflowRun)$/i.test(String(action || "")); }
function stepsFromCarrier(value) { if (Array.isArray(value)) return value; if (!value || typeof value !== "object") return []; if (Array.isArray(value.steps)) return value.steps; if (Array.isArray(value.actions)) return value.actions; if (Array.isArray(value.do)) return value.do; if (Array.isArray(value.workflow?.steps)) return value.workflow.steps; return []; }
function shaped($i, payload, result, status) { return json($i, pruneTunnelResponse(attachActionGuidance(result, payload), payload), status); }
function controlBaseUrl(tunnelName) { return "https://awtsmoos.com/api/tunnel/control/fs/" + encodeURIComponent(tunnelName || "auto"); }
function authFailure($i, payload, ident) { return shaped($i, payload, { BH: "B\"H", ok: false, error: ident.error || "not_authenticated", message: "Log in, use OAuth Bearer, or x-awtsmoos-api-key." }, 401); }
function scopeFailure($i, ident, payload) { const neededScope = actionRequiredScope(payload.action); return identityAllows(ident, neededScope) ? null : shaped($i, payload, { BH: "B\"H", ok: false, error: "missing_scope", neededScope, identityKind: ident.kind }, 403); }
function rateFailure($i, payload, rate) { return shaped($i, payload, { BH: "B\"H", ok: false, error: rate.error, limit: rate.limit }, 429); }
function timeoutFailure($i, payload, error) { return shaped($i, payload, { BH: "B\"H", ok: false, error: "timeout_too_large", message: error.message, maxTimeoutMs: error.maxTimeoutMs || ONE_DAY_MS }, error.status || 400); }
function insufficientPerutas($i, payload, a) { return shaped($i, payload, { BH: "B\"H", ok: false, status: 402, error: "insufficient_perutas", requiredPerutas: a.estimatedPerutas, balance: a.balance, shortfall: a.shortfall, purchaseUrl: a.purchaseUrl, message: a.messageForAi }, 402); }
async function runResolvedVessel($i, ident, payload, vessel, affordability) { try { const started = Date.now(), result = await vessel.send(), withPreview = autoCreatePreviewResult(ident, payload, result), withAccount = maybeAttachAccountSave(ident, payload, withPreview); withAccount.controlRequestId = payload.controlRequestId; withAccount.clientRequestId = payload.clientRequestId; withAccount.nonce = payload.nonce; withAccount.estimatedPerutas = affordability.estimatedPerutas; publishHandoff(vessel.tunnelName || payload.tunnelName, { action: payload.action, result: withAccount }); const shapedResult = pruneTunnelResponse(attachActionGuidance(maybeExternalize(withAccount, payload), payload), payload); recordFsUsage(ident, payload, shapedResult, result.ok !== false, Date.now() - started); shapedResult.routePreference = rememberRoutePreference(ident.userId, payload.conversationId, vessel, payload); recordActionEvent(ident, payload, shapedResult, vessel); return json($i, shapedResult, shapedResult.status || result.status || 200); } catch (e) { const failure = pruneTunnelResponse(attachActionGuidance({ BH: "B\"H", ok: false, error: e.message, stack: e.stack }, payload), payload); recordFsUsage(ident, payload, failure, false, 0); publishHandoff(payload.tunnelName, { action: payload.action, result: failure }); return json($i, failure, e.status || 500); } }
function recordActionEvent(ident, payload, result, vessel) { recordConversationEvent(ident.userId, { conversationId: payload.conversationId, conversationName: payload.conversationName, kind: /^preview/i.test(payload.action || "") ? "preview" : "action", action: payload.action, title: result.title || result.preview?.title || payload.action, ok: result.ok !== false, tunnelName: vessel.tunnelName || payload.tunnelName, targetVessel: payload.targetVessel || vessel.kind, path: payload.path || payload.url || payload.cwd, previewId: result.previewId || result.createdPreview?.id, viewUrl: result.viewUrl || result.url, peruta: result.peruta, summary: result.error || result.message || result.routeReason || "" }); }
function maybeAttachAccountSave(ident, payload, result) { if (payload.action !== "aiAgentSetProviderKey" || !shouldSaveRemote(payload)) return result; return { ...result, accountProviderKey: saveAccountProviderKey(ident.userId, payload) }; }
function recordFsUsage(ident, payload, result, ok, durationMs) { const entry = { userId: ident.userId, keyId: ident.keyId || null, action: `${payload.tunnelName || "auto"}:${payload.action}`, path: payload.path || payload.absolutePath || payload.cwd || payload.url || null, bytes: responseBytes(result), files: result.returnedCount || result.count || 0, seconds: Math.max(0, Number(durationMs || 0) / 1000), ok }; recordUsage(entry); result.peruta = compactPerutaReceipt(chargeUsage(entry)); }
function compactPerutaReceipt(peruta = {}) { return { chargedPerutas: peruta.chargedPerutas || 0, category: peruta.category || "routing", balance: peruta.balance || 0, plan: peruta.plan || "free", purchaseUrl: peruta.purchaseUrl }; }
function parseCarrier(value, fallback = {}) { if (value === undefined || value === null || value === "") return fallback; if (typeof value === "object") return value; try { return JSON.parse(String(value)); } catch { return fallback === undefined ? value : fallback; } }
function parse64(value, fallback = {}) { if (!value) return fallback; try { return JSON.parse(Buffer.from(String(value), "base64").toString("utf8")); } catch { return fallback; } }
function firstDefined(...values) { return values.find(value => value !== undefined && value !== null); }
function mergeObject(target, source) { if (!source || typeof source !== "object" || Array.isArray(source)) return target; for (const [key, value] of Object.entries(source)) if (value !== undefined) target[key] = value; return target; }
function isCommandTree(action) { return /commandTree|awtsmoosCommandTree|merkavaCommandTree/.test(String(action || "")); }
function attachCorrelation(payload, ident, tunnelName) { payload.controlRequestId = payload.controlRequestId || requestId("ctl"); payload.clientRequestId = payload.clientRequestId || payload.requestId || requestId("client"); payload.logicalAgentId = payload.logicalAgentId || payload.agentClientId || logicalAgentId(ident, payload); payload.agentSessionId = payload.agentSessionId || sessionId(ident, payload, tunnelName); payload.nonce = payload.nonce || requestId("nonce"); }
function logicalAgentId(ident, payload) { return ["agent", ident.userId || "anonymous", payload.conversationId || payload.conversationName || "default"].map(slug).join(":"); }
function sessionId(ident, payload, tunnelName) { return ["session", ident.userId || "anonymous", tunnelName || "auto", payload.conversationId || payload.conversationName || "default"].map(slug).join(":"); }
function slug(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9._:-]+/g, "-").replace(/^-+|-+$/g, "") || "x"; }
function requestId(prefix = "ctl") { return prefix + "_" + Date.now().toString(36) + "_" + crypto.randomBytes(8).toString("hex"); }
module.exports = { boundedTunnelTimeout, protectedFs, ONE_DAY_MS, normalizeCarriers };
