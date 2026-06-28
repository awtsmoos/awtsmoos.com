// B"H
const Policy = require('./policy.js');
const Next = require('./extractNext.js');
const Guard = require('./guard.js');
const Receipts = require('./receipts.js');
async function run(config, payload, ws, buildActions) {
  const policy = Policy.normalize(payload), started = Date.now(), trace = [];
  let next = Next.initial(payload), errors = 0, last = null, reason = '';
  for (let step = 0; step < policy.maxSteps; step++) {
    if (!next?.action) { reason = 'no_next_action'; break; }
    const request = Next.clean(next), actions = buildActions(config, request, ws), fn = actions[request.action];
    if (!fn) { errors++; last = { ok: false, action: request.action, error: 'unknown_action' }; reason = 'unknown_action'; break; }
    const result = await fn(); last = result;
    if (Guard.mismatch(request.action, result)) return fail(config, payload, trace, request, result, 'action_mismatch');
    trace.push({ step, action: request.action, ok: result?.ok !== false, next: Next.extract(result)?.action || '' });
    next = Next.extract(result); reason = Guard.shouldStop(result, next, policy, started, step + 1, errors);
    if (reason) break;
  }
  const receipt = { at: new Date().toISOString(), action: payload.action, reason: reason || 'loop_exhausted', steps: trace.length, elapsedMs: Date.now() - started, next, trace };
  Receipts.record(config, receipt);
  return { ok: true, action: payload.action, receipt, last, mustCallNext: next || null, finalAnswerAllowed: last?.finalAnswerAllowed === true && !next, mustContinue: Boolean(next) || last?.mustContinue === true };
}
function fail(config, payload, trace, request, result, reason) { const receipt = { at: new Date().toISOString(), action: payload.action, reason, trace, request, actual: result?.action || result?.actualAction || '' }; Receipts.record(config, receipt); return { ok: false, action: payload.action, error: reason, receipt, result }; }
module.exports = { run };
