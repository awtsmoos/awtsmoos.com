// B"H
const ALLOWED_REPAIR_ACTIONS = Object.freeze([
  'awtsmoosMyDevice','tunnelDoctor','tunnelLivenessTimeline','agentDoctor',
  'agentSelfTest','agentVersionSkewCheck','payloadEcho','actionSchemaTrace',
  'actionHistoryGet','actionHistoryList','actionHistorySearch','commandStatus',
  'commandWait','commandPoll','commandJobStatus','commandJobWait',
  'commandJobOutputPage','commandCancel','commandJobCancel','missionGet',
  'missionStatus','missionRecovery','missionHeartbeat','missionDaemonStatus',
  'missionWatchdogStatus','missionWatchdogRecover'
]);
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
  const next = saneNext(lock), guide = guidance(action, next);
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
    mission: { locked: true, missionId: lock.missionId || '', status: lock.releaseStatus || 'locked', next, guidance: guide },
    agentGuidance: 'A mission is active. Call the required mission action next, or use an allowed liveness/repair action if the tunnel is unhealthy.',
    responseFocus: {
      missionLocked: true,
      originalActionPreserved: action,
      nextRequiredToolCall: next,
      oneMainThing: 'Follow the mission next action, or retry only safe repair work with ignoreMissionLock.'
    },
    recovery: { allowedRepairActions: [...ALLOWED_REPAIR_ACTIONS], ignoreMissionLockForGenuineRepair: true }
  };
}
function guidance(action, next = {}) {
  return { originalActionPreserved: action, nextAction: next, recovery: 'Call the next mission action, or use an allowed liveness/repair action.' };
}
function fallback(missionId, reason) { return { action: 'missionDaemonTick', missionId, reason }; }
function boot(missionId, reason) { return { action: 'missionBootResume', missionId, autoMission: true, tick: true, reason }; }
module.exports = { response, saneNext, guidance, ALLOWED_REPAIR_ACTIONS };
