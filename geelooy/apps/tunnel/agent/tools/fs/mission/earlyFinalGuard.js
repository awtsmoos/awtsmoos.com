// B"H

function record(m, input = {}, env, verdict) {
  m.earlyFinalAttempts ||= [];
  const attempt = { id: input.id || `early_final_${Date.now().toString(36)}`, at: new Date().toISOString(), reason: input.reason || 'agent_attempted_final_before_finalize', message: input.message || input.finalAnswer || '', verdict };
  m.earlyFinalAttempts.push(attempt);
  env.event(m, 'early_final_attempt', attempt.reason, { attemptId: attempt.id, issues: verdict.issues });
  return attempt;
}

/**
 * B"H
 * Chapter 552: The premature goodbye is not erased. It is recorded, blessed
 * with a lesson, and sent back to the next unfinished spark.
 */
module.exports = { record };
