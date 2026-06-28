// B"H
const Lease = require('./lease.js');

const SOFT_REASONS = new Set([
  'max_ms_reached',
  'max_steps_reached',
  'final_answer_allowed',
  'no_next_action',
  'mission_gate_required'
]);

function mismatch(requested, result = {}) {
  const actual = result.action || result.actualAction || '';
  return requested && actual && requested !== actual;
}

function rawStopReason(result = {}, next, policy, started, steps, errors) {
  if (Date.now() - started >= policy.maxMs) return 'max_ms_reached';
  if (steps >= policy.maxSteps) return 'max_steps_reached';
  if (errors > policy.maxErrors) return 'max_errors_reached';
  if (policy.stopOnGate && result.responseFocus?.mustAnswerGate) return 'mission_gate_required';
  if (!next && result.finalAnswerAllowed === true && result.mustContinue !== true) return 'final_answer_allowed';
  if (!next) return 'no_next_action';
  return '';
}

/**
 * B"H
 * Soft endings are not endings while the one-hour lease still burns.
 */
function shouldStop(result = {}, next, policy, started, steps, errors) {
  const reason = rawStopReason(result, next, policy, started, steps, errors);
  if (!reason) return '';
  if (Lease.active(policy.lease) && SOFT_REASONS.has(reason)) return '';
  return reason;
}

module.exports = { mismatch, shouldStop, rawStopReason, SOFT_REASONS };
