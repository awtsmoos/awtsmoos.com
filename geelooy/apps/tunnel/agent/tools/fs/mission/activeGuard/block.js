// B"H
function saneNext(lock = {}) {
  const next = lock.lastMustCallNext || null;
  if (!next || typeof next !== 'object') return { action: 'missionBootResume', missionId: lock.missionId || '', autoMission: true, tick: true, reason: 'missing_lock_next_action' };
  const action = String(next.action || '');
  const nextMission = String(next.missionId || '');
  const lockMission = String(lock.missionId || '');
  if (!action) return { action: 'missionBootResume', missionId: lockMission, autoMission: true, tick: true, reason: 'empty_lock_next_action' };
  if (action.startsWith('mission') && lockMission && nextMission && nextMission !== lockMission) return { action: 'missionBootResume', missionId: lockMission, autoMission: true, tick: true, reason: 'stale_lock_next_mission_id' };
  if (action.startsWith('mission') && !nextMission && action !== 'missionBootResume') return { action: 'missionBootResume', missionId: lockMission, autoMission: true, tick: true, reason: 'missing_lock_next_mission_id' };
  return next;
}
function response(action, lock = {}) {
  const next = saneNext(lock);
  return {
    ok: false,
    action,
    error: 'mission_lock_blocks_unrelated_action',
    blockedAction: action,
    missionId: lock.missionId || '',
    releaseStatus: lock.releaseStatus || 'locked',
    finalAnswerAllowed: false,
    mustContinue: true,
    mustCallNext: next,
    missionExplanation: {
      phase: 'mission-lock-block',
      whyBlocked: 'The tunnel found an active mission lock, so unrelated actions must not bury the required continuation step.',
      whyThisNextAction: 'The next action was sanitized so stale or missing mission ids route through missionBootResume instead of trapping the agent in mission_not_found.',
      releaseCondition: 'Release only after the mission court/finalization path explicitly allows it.',
      alternativeConsidered: 'Retrying the stale next action was rejected because it can reproduce the old locked-but-missing loop.'
    },
    responseFocus: { missionLocked: true, oneMainThing: 'Call the sanitized mustCallNext action. If it references boot resume, let it repair the mission lock.' }
  };
}
module.exports = { response, saneNext };
