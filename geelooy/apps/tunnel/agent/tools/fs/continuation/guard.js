// B"H
function mismatch(requested, result = {}) { const actual = result.action || result.actualAction || ''; return requested && actual && requested !== actual; }
function shouldStop(result = {}, next, policy, started, steps, errors) {
  if (Date.now() - started >= policy.maxMs) return 'max_ms_reached';
  if (steps >= policy.maxSteps) return 'max_steps_reached';
  if (errors > policy.maxErrors) return 'max_errors_reached';
  if (policy.stopOnGate && result.responseFocus?.mustAnswerGate) return 'mission_gate_required';
  if (!next && result.finalAnswerAllowed === true && result.mustContinue !== true) return 'final_answer_allowed';
  if (!next) return 'no_next_action';
  return '';
}
module.exports = { mismatch, shouldStop };
