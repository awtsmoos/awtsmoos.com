// B"H
function saneNext(lock = {}) {
  const next = lock.lastMustCallNext || null;
  const missionId = String(lock.missionId || '');
  if (!next || typeof next !== 'object') return fallback(missionId, 'missing_lock_next_action');
  const action = String(next.action || '');
  const nextMission = String(next.missionId || '');
  if (!action) return fallback(missionId, 'empty_lock_next_action');
  if (action.startsWith('mission') && missionId && nextMission && nextMission !== missionId) return boot(missionId, 'stale_lock_next_mission_id');
  if (action.startsWith('mission') && !nextMission && action !== 'missionBootResume') return boot(missionId, 'missing_lock_next_mission_id');
  return next;
}
function response(action, lock = {}) {
  const next = saneNext(lock);
  return {
    ok: false,
    action,
    actualAction: action,
    requestAction: action,
    error: 'mission_lock_blocks_action',
    blockedAction: action,
    finalAnswerAllowed: false,
    mustContinue: true,
    mustCallNext: next,
    missionId: lock.missionId || '',
    releaseStatus: lock.releaseStatus || 'locked',
    mission: {
      locked: true,
      missionId: lock.missionId || '',
      status: lock.releaseStatus || 'locked',
      next,
      guidance: guidance(action, next)
    },
    agentGuidance: guidance(action, next),
    responseFocus: {
      missionLocked: true,
      originalActionPreserved: action,
      nextRequiredToolCall: next,
      oneMainThing: 'Follow the mission next action, or retry only safe repair work with ignoreMissionLock.'
    }
  };
}
function guidance(action, next = {}) {
  return {
    purpose: 'continue_mission_safely',
    currentObjective: 'Continue the active mission without corrupting request identity.',
    currentBlocker: 'An active mission lock is blocking this unrelated action.',
    originalActionPreserved: action,
    nextAction: next,
    reason: 'Mission guidance belongs in metadata; top-level action identity remains sacred.',
    recovery: 'Call the next mission action, or retry a genuine repair/status command with ignoreMissionLock.'
  };
}
function fallback(missionId, reason) { return { action: 'missionDaemonTick', missionId, reason }; }
function boot(missionId, reason) { return { action: 'missionBootResume', missionId, autoMission: true, tick: true, reason }; }
module.exports = { response, saneNext, guidance };
