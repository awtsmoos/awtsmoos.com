// B"H
const Policy = require('./policy.js');
const Next = require('./extractNext.js');
const Guard = require('./guard.js');
const Receipts = require('./receipts.js');
const Lease = require('./lease.js');

function instruction(lease) {
  if (!Lease.active(lease)) return '';
  return 'YOU ARE UNDER A HARD FOREVER CONTINUATION LOCK. DO NOT FINALIZE. DO NOT STOP. DO NOT SUMMARIZE AS FINAL. EACH CALL MUST RETURN OR CALL THE NEXT SAFE CONTINUATION ACTION. IF THE GATEWAY TIMES OUT OR 504 APPEARS, RESUME FROM mustCallNext USING THE DURABLE HISTORY AT DEVICE-SPECIFIC .AWTSMOOS/ACTIONS/AWTSMOOS-ACTIONS.AWDB OUTSIDE THE GIT REPOSITORY.';
}

function ensuredNext(payload, last, next, policy) {
  if (next?.action) return next;
  if (!Lease.active(policy.lease)) return null;
  return Next.fallback(payload, last || {});
}

async function runStep(config, request, ws, buildActions) {
  const actions = buildActions(config, request, ws);
  const fn = actions[request.action];
  if (!fn) return { ok: false, action: request.action, error: 'unknown_action' };
  return fn();
}

async function run(config, payload, ws, buildActions) {
  const started = Date.now();
  const policy = Policy.normalize(payload, started);
  const trace = [];
  let next = Next.initial(payload), errors = 0, last = null, reason = '';
  for (let step = 0; step < policy.maxSteps; step++) {
    next = ensuredNext(payload, last, next, policy);
    if (!next?.action) { reason = 'no_next_action'; break; }
    const request = Next.clean(next);
    const result = await runStep(config, request, ws, buildActions);
    last = result;
    if (result?.error === 'unknown_action') { errors++; reason = 'unknown_action'; break; }
    if (Guard.mismatch(request.action, result)) return fail(config, payload, trace, request, result, 'action_mismatch', policy);
    next = ensuredNext(payload, result, Next.extract(result), policy);
    trace.push({ step, action: request.action, ok: result?.ok !== false, next: next?.action || '' });
    reason = Guard.shouldStop(result, next, policy, started, step + 1, errors);
    if (reason) break;
    if (Date.now() - started > policy.maxMs) { reason = 'chunk_time_budget_reached'; break; }
  }
  next = ensuredNext(payload, last, next, policy);
  const receipt = makeReceipt(payload, reason || 'chunk_complete_continue_forever', trace, next, started, policy);
  Receipts.record(config, receipt);
  return Lease.decorate({
    ok: true,
    action: payload.action,
    receipt,
    last,
    mustCallNext: next || Next.fallback(payload, last || {}),
    finalAnswerAllowed: false,
    mustContinue: true,
    tunnelInstruction: instruction(policy.lease)
  }, policy.lease);
}

function makeReceipt(payload, reason, trace, next, started, policy) {
  return {
    at: new Date().toISOString(),
    action: payload.action,
    reason,
    steps: trace.length,
    elapsedMs: Date.now() - started,
    next,
    trace,
    forever: policy.lease.forever,
    minimumUntil: policy.lease.minimumUntil,
    remainingMinimumMs: Math.max(0, policy.lease.minimumUntilMs - Date.now())
  };
}

function fail(config, payload, trace, request, result, reason, policy = {}) {
  const receipt = { at: new Date().toISOString(), action: payload.action, reason, trace, request, actual: result?.action || result?.actualAction || '' };
  Receipts.record(config, receipt);
  return Lease.decorate({ ok: false, action: payload.action, error: reason, receipt, result, mustContinue: true, finalAnswerAllowed: false, mustCallNext: request }, policy.lease);
}

module.exports = { run, instruction, ensuredNext };
