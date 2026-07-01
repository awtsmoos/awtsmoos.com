// B"H
const DEFAULT_STEPS = 4;
const SACRED_KEYS = Object.freeze([
  'requestId', 'id', 'action', 'requestAction', 'actualAction', 'jobId',
  'correlationId', 'clientRequestId', 'controlRequestId', 'nonce', 'vessel',
  'workspaceId', 'tunnelName', 'cwd', 'command', 'path', 'paths'
]);
const MISSION_SIDE_KEYS = Object.freeze([
  'missionId', 'finalAnswerAllowed', 'mustContinue', 'mustCallNext',
  'workQueue', 'liveActionToPerform', 'fileWorkRequired'
]);
function needs(result = {}) {
  return result.userVisibleAnswerBlocked === true &&
    result.finalAnswerAllowed !== true &&
    !!result.nextRequiredToolCall?.action;
}
function allowed(next = {}) {
  const action = String(next.action || '');
  return action.startsWith('mission') || action.startsWith('actionHistory');
}
function budget(payload = {}, maxSteps) {
  if (payload.disableAutoContinuation === true || payload.autoContinuation === false) return 0;
  const raw = payload.autoContinuationBudget || process.env.AWTSMOOS_AUTO_CONTINUATION_STEPS || maxSteps || DEFAULT_STEPS;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.min(12, Math.floor(n))) : DEFAULT_STEPS;
}
async function run(ctx = {}) {
  const first = ctx.result;
  const sacred = identity(ctx.payload, ctx.data, first);
  let result = first, trace = [], seen = new Map(), final = null;
  for (let i = 0, max = budget(ctx.payload, ctx.maxSteps); i < max && needs(result); i++) {
    const next = result.nextRequiredToolCall;
    if (!allowed(next)) return preserve(first, result, trace, 'next_action_not_allowed_for_internal_loop', sacred);
    const key = `${next.action}:${next.missionId || ''}`;
    seen.set(key, (seen.get(key) || 0) + 1);
    if (seen.get(key) > 2) return preserve(first, result, trace, 'repeated_next_action_loop_guard', sacred);
    trace.push({ step: i + 1, action: next.action, missionId: next.missionId || '', reason: next.reason || '' });
    const payload = { ...next, kind: 'fs', autoContinuation: true, continuationToken: result.continuationToken, originalAction: sacred.requestAction };
    const data = { ...(ctx.data || {}), id: `${ctx.data?.id || sacred.id || 'auto'}:continue:${i + 1}` };
    final = await ctx.dispatch(ctx.normalize(payload), payload, ctx.ws, data);
    result = final;
  }
  return trace.length ? preserve(first, final || result, trace, '', sacred) : first;
}
function identity(payload = {}, data = {}, first = {}) {
  const action = String(payload.action || first.requestAction || first.action || '');
  return {
    requestId: payload.requestId || first.requestId || '',
    id: data.id || first.id || payload.id || '',
    action: action || first.action || '',
    requestAction: action || first.requestAction || first.action || '',
    actualAction: first.actualAction || action || first.action || '',
    jobId: first.jobId || payload.jobId || '',
    correlationId: payload.correlationId || first.correlationId || '',
    clientRequestId: payload.clientRequestId || first.clientRequestId || payload.requestId || '',
    controlRequestId: payload.controlRequestId || first.controlRequestId || payload.requestId || payload.id || '',
    nonce: payload.nonce || first.nonce || '',
    vessel: payload.vessel || first.vessel || '',
    workspaceId: payload.workspaceId || first.workspaceId || '',
    tunnelName: payload.tunnelName || first.tunnelName || '',
    cwd: first.cwd || payload.cwd || '',
    command: first.command || payload.command || '',
    path: first.path || payload.path || payload.p || '',
    paths: first.paths || payload.paths || undefined
  };
}
function preserve(first = {}, final = {}, trace = [], stopped = '', sacred = {}) {
  const mission = {
    ...(isObject(first.mission) ? first.mission : {}),
    continuation: compactMission(final),
    finalAction: String(final?.action || ''),
    active: final?.finalAnswerAllowed !== true,
    trace
  };
  const out = { ...first, autoContinuationFinal: final, autoContinuationTrace: trace, autoContinuationSteps: trace.length, mission };
  restoreIdentity(out, first, sacred);
  if (stopped) out.autoContinuationStopped = stopped;
  return out;
}
function restoreIdentity(out, first = {}, sacred = {}) {
  for (const key of SACRED_KEYS) {
    const value = sacred[key] !== undefined ? sacred[key] : first[key];
    if (value !== undefined && value !== null && String(value) !== '') out[key] = value;
  }
  const request = String(out.requestAction || out.action || first.requestAction || first.action || '');
  if (request) out.action = request;
  if (request) out.requestAction = request;
  if (!out.actualAction) out.actualAction = request || out.action || '';
  return out;
}
function compactMission(final = {}) {
  const got = {};
  for (const key of MISSION_SIDE_KEYS) if (final[key] !== undefined) got[key] = final[key];
  return got;
}
function isObject(value) { return !!value && typeof value === 'object' && !Array.isArray(value); }
function mark(result, trace, reason) { return preserve(result, result, trace, reason, identity({}, {}, result)); }
/** B"H — continuation now walks beside the vessel; it never steals the vessel's face. */
module.exports = { allowed, budget, needs, run, preserve, mark, identity, restoreIdentity };
