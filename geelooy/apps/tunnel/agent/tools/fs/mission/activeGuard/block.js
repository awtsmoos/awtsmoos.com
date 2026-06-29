// B"H
function saneNext(lock = {}) {
  const next = lock.lastMustCallNext || null;
  if (!next || typeof next !== 'object') return { action: 'missionDaemonTick', missionId: lock.missionId || '', reason: 'missing_lock_next_action' };
  const action = String(next.action || '');
  const nextMission = String(next.missionId || '');
  const lockMission = String(lock.missionId || '');
  if (!action) return { action: 'missionDaemonTick', missionId: lockMission, reason: 'empty_lock_next_action' };
  if (action.startsWith('mission') && lockMission && nextMission && nextMission !== lockMission) return { action: 'missionBootResume', missionId: lockMission, autoMission: true, tick: true, reason: 'stale_lock_next_mission_id' };
  if (action.startsWith('mission') && !nextMission && action !== 'missionBootResume') return { action: 'missionBootResume', missionId: lockMission, autoMission: true, tick: true, reason: 'missing_lock_next_mission_id' };
  return next;
}
function response(action, lock = {}) {
  const next = saneNext(lock);
  return {
    ok: false, action, error: 'mission_lock_blocks_unrelated_action', blockedAction: action,
    missionId: lock.missionId || '', releaseStatus: lock.releaseStatus || 'locked', finalAnswerAllowed: false,
    mustContinue: true, mustCallNext: next,
    missionExplanation: {
      phase: 'mission-lock-block',
      whyBlocked: 'The tunnel found an active mission lock. It is blocking unrelated escape actions, not productive mission work.',
      whyThisNextAction: 'The next action was sanitized so stale or missing mission ids repair state and empty next actions route to daemon continuation instead of no-op waiting.',
      agentAuthority: 'ABSOLUTE MISSION FREEDOM INSIDE THE MISSION SYSTEM: inspect, plan, brainstorm, write complete files, test, diagnose, and continue without asking the user again when safe and relevant.',
      releaseCondition: 'Release only after the mission court/finalization path explicitly allows it.',
      alternativeConsidered: 'Stopping or claiming blockage was rejected because the mission still provides a route for progress.'
    },
    responseFocus: { missionLocked: true, oneMainThing: 'Do not stop. Follow mustCallNext, then keep doing productive mission-scope work.' }
  };
}
module.exports = { response, saneNext };
