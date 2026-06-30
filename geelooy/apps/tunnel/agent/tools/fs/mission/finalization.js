// B"H
const Covenant = require('./continuationCovenant.js');
function createFinalization(env) {
  function queueStatus(m) { return env.ContinuationQueue.status(m); }
  function queueAdd(m, input = {}) {
    const item = env.ContinuationQueue.add(m, input);
    env.event(m, 'continuation_queue_add', item.title, { queueId: item.id });
    return item;
  }
  function queueComplete(m, input = {}) {
    const item = env.ContinuationQueue.complete(m, input);
    if (item) env.event(m, 'continuation_queue_complete', item.title, { queueId: item.id });
    return item;
  }
  function cycle(m, input = {}) {
    const c = env.CycleArtifacts.record(m, input);
    env.event(m, 'innovation_cycle', c.id, { complete: c.complete, missing: env.CycleArtifacts.missing(c) });
    return c;
  }
  function finalizeVerdict(m, input = {}) { return env.FinalizePolicy.verdict(m, input, env); }
  function finalize(m, input = {}) {
    const verdict = finalizeVerdict(m, input);
    if (!verdict.ok) return blocked(m, input, verdict);
    const released = verdict.stopReason === 'user_approved_release_and_debt_clear';
    const finalization = {
      id: input.id || `final_${Date.now().toString(36)}`,
      at: env.now(),
      reason: input.finalizationReason || verdict.stopReason,
      evidenceIds: input.evidenceIds || [],
      cycleIds: (m.innovationCycles || []).map(c => c.id),
      protocolCycles: (m.protocolCycles || []).map(c => c.id),
      releaseApprovedByUser: Covenant.approved(m, input),
      checkpointMessage: verdict.checkpointMessage,
      released,
      stopped: !released,
      verdict
    };
    m.finalizations ||= [];
    m.finalizations.push(finalization);
    m.status = released ? 'released' : 'stopped';
    env.event(m, released ? 'mission_released' : 'mission_stopped', finalization.reason, { finalizationId: finalization.id });
    return { ok: true, finalized: true, released, stopped: !released, finalization, verdict, finalAnswerAllowed: true, mustContinue: false };
  }
  function blocked(m, input, verdict) {
    const attempt = env.EarlyFinalGuard.record(m, input, env, verdict);
    const next = env.FinalizePolicy.mustCallNext(m, verdict);
    return {
      ok: false,
      finalized: false,
      released: false,
      stopped: false,
      error: 'final_answer_blocked',
      attempt,
      verdict,
      ...Covenant.blockedResponse(m, verdict, next),
      releaseExplanation: 'MISSION RELEASE BLOCKED. CHECKPOINT REACHED. CONTINUING.'
    };
  }
  function nextRequiredAction(m) {
    if (m.bossProtocol?.enabled) return env.BossProtocol.next(m);
    env.ContinuationQueue.ensure(m);
    const q = env.ContinuationQueue.next(m);
    if (q) return { action: 'missionQueueComplete', missionId: m.id, queueId: q.id, proof: `Complete: ${q.title}` };
    return { action: 'missionCycle', missionId: m.id, inspection: 'inspect for remaining risk', plan: 'choose next improvement', verification: 'prove it', selfCritique: 'criticize the result', nextIdeas: ['continue'] };
  }
  return { queueStatus, queueAdd, queueComplete, cycle, finalizeVerdict, finalize, nextRequiredAction };
}
module.exports = { createFinalization };
