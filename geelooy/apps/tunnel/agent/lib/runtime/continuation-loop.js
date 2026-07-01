// B"H
const DEFAULT_STEPS = 4;
const MISSION_SIDE_KEYS = Object.freeze(['missionId','finalAnswerAllowed','mustContinue','mustCallNext','workQueue','liveActionToPerform','fileWorkRequired']);
function needs(result = {}) { return result.userVisibleAnswerBlocked === true && result.finalAnswerAllowed !== true && result.nextRequiredToolCall?.action; }
function allowed(next = {}) { const a = String(next.action || ''); return a.startsWith('mission') || a.startsWith('actionHistory'); }
function budget(payload = {}, maxSteps) {
  if (payload.disableAutoContinuation === true || payload.autoContinuation === false) return 0;
  const n = Number(payload.autoContinuationBudget || process.env.AWTSMOOS_AUTO_CONTINUATION_STEPS || maxSteps || DEFAULT_STEPS);
  return Number.isFinite(n) ? Math.max(0, Math.min(12, Math.floor(n))) : DEFAULT_STEPS;
}
async function run(ctx = {}) {
  const first = ctx.result;
  let result = first, trace = [], seen = new Map(), final = null;
  for (let i = 0, max = budget(ctx.payload, ctx.maxSteps); i < max && needs(result); i++) {
    const next = result.nextRequiredToolCall;
    if (!allowed(next)) return preserve(first, result, trace, 'next_action_not_allowed_for_internal_loop');
    const key = `${next.action}:${next.missionId || ''}`;
    seen.set(key, (seen.get(key) || 0) + 1);
    if (seen.get(key) > 2) return preserve(first, result, trace, 'repeated_next_action_loop_guard');
    trace.push({ step:i + 1, action:next.action, missionId:next.missionId || '', reason:next.reason || '' });
    const payload = { ...next, kind:'fs', autoContinuation:true, continuationToken:result.continuationToken, originalAction:ctx.payload?.action || '' };
    final = await ctx.dispatch(ctx.normalize(payload), payload, ctx.ws, { ...(ctx.data || {}), id:`${ctx.data?.id || 'auto'}:continue:${i + 1}` });
    result = final;
  }
  return trace.length ? preserve(first, final || result, trace, '') : result;
}
function preserve(first = {}, final = {}, trace = [], stopped = '') {
  const mission = { continuation: compactMission(final), finalAction: final?.action || '', active: final?.finalAnswerAllowed !== true };
  const out = { ...first, autoContinuationFinal: final, autoContinuationTrace: trace, autoContinuationSteps: trace.length, mission };
  if (stopped) out.autoContinuationStopped = stopped;
  return out;
}
function compactMission(final = {}) { const got = {}; for (const key of MISSION_SIDE_KEYS) if (final[key] !== undefined) got[key] = final[key]; return got; }
function mark(result, trace, reason) { return preserve(result, result, trace, reason); }
/** B"H — mission continuation walks beside the request; it no longer steals the request's face. */
module.exports = { allowed, budget, needs, run, preserve, mark };
