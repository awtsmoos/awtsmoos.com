// B"H
const DEFAULT_STEPS = 4;
function needs(result = {}) { return result.userVisibleAnswerBlocked === true && result.finalAnswerAllowed !== true && result.nextRequiredToolCall?.action; }
function allowed(next = {}) { return String(next.action || '').startsWith('mission') || String(next.action || '').startsWith('actionHistory'); }
function budget(payload = {}, maxSteps) {
  if (payload.disableAutoContinuation === true || payload.autoContinuation === false) return 0;
  const n = Number(payload.autoContinuationBudget || process.env.AWTSMOOS_AUTO_CONTINUATION_STEPS || maxSteps || DEFAULT_STEPS);
  return Number.isFinite(n) ? Math.max(0, Math.min(12, Math.floor(n))) : DEFAULT_STEPS;
}
async function run(ctx = {}) {
  let result = ctx.result, trace = [], seen = new Map();
  for (let i = 0, max = budget(ctx.payload, ctx.maxSteps); i < max && needs(result); i++) {
    const next = result.nextRequiredToolCall;
    if (!allowed(next)) return mark(result, trace, 'next_action_not_allowed_for_internal_loop');
    const key = `${next.action}:${next.missionId || ''}`;
    seen.set(key, (seen.get(key) || 0) + 1);
    if (seen.get(key) > 2) return mark(result, trace, 'repeated_next_action_loop_guard');
    trace.push({ step:i + 1, action:next.action, missionId:next.missionId || '', reason:next.reason || '' });
    const payload = { ...next, kind:'fs', autoContinuation:true, continuationToken:result.continuationToken, originalAction:ctx.payload?.action || '' };
    result = await ctx.dispatch(ctx.normalize(payload), payload, ctx.ws, { ...(ctx.data || {}), id:`${ctx.data?.id || 'auto'}:continue:${i + 1}` });
  }
  return trace.length ? { ...result, autoContinuationTrace:trace, autoContinuationSteps:trace.length } : result;
}
function mark(result, trace, reason) { return { ...result, autoContinuationTrace:trace, autoContinuationStopped:reason, autoContinuationSteps:trace.length }; }
/** B"H — The native agent spends its own breath before asking the model to breathe. */
module.exports = { allowed, budget, needs, run };
