// B"H
/**
 * B"H — Guidance begins as facts, not slogans.
 * Actions provide state; the renderer turns that state into calm English for
 * agents who need to keep choosing useful work without becoming mechanical.
 */
function from(action, out = {}, mission = {}) {
  const room = out.room || {}, health = out.health || room.health || {};
  const work = out.nextHighestWork || health.nextHighestWork || room.nextHighestWork;
  return {
    action, missionId: mission.id || out.missionId || room.missionId,
    state: out.mustContinue === false ? 'paused' : 'active', reason: reasonFor(action, work),
    canSteer: out.finalAnswerAllowed === false || action.includes('Steer') || action.includes('Room'),
    stopAllowed: out.finalAnswerAllowed === true, queueDepth: queueDepth(room.scheduler),
    blocker: (room.blockingInterrupts || [])[0] || null, suggestedMode: work?.kind || 'discover',
    confidence: work ? 0.86 : 0.62, nextAction: work?.item?.action || out.next?.action || null
  };
}
function reasonFor(action, work) {
  if (work?.kind === 'interrupt') return 'blocked_work_found';
  if (work?.kind === 'claim') return 'active_claim_found';
  if (work?.kind === 'futureQueue') return 'queued_future_work';
  if (action.includes('Steer')) return 'steering_requested';
  return 'mission_still_has_options';
}
function queueDepth(scheduler = {}) {
  return (scheduler.agents || []).reduce((sum, agent) => sum + Object.keys(agent).filter(k => k.endsWith('Queue')).reduce((n, k) => n + (agent[k]?.length || 0), 0), 0);
}
module.exports = { from };
