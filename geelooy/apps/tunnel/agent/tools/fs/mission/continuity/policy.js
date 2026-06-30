// B"H
const STOP_ACTIONS = new Set(['missionStop', 'missionFinalize', 'missionProtocolFinalizeCheck']);
const DONE_WORDS = ['complete', 'completed', 'done', 'finished', 'final', 'success'];

/**
 * B"H
 * Chapter 1905: Completion knocked; continuity answered the door.
 *
 * A mission may steer anywhere except into ordinary ending. Ending requires a
 * deliberate stop/finalize gate, not merely an empty queue or satisfied step.
 */
function explicitStop(payload = {}) {
  if (payload.userStop === true || payload.explicitStop === true) return true;
  return STOP_ACTIONS.has(String(payload.action || '')) && payload.confirm === true;
}
function active(lock) { return !!lock?.missionId && lock.releaseAllowed !== true; }
function next(lock = {}, result = {}) {
  return result.mustCallNext || result.nextRequiredAction || lock.lastMustCallNext || { action:'missionNext', missionId:lock.missionId, auto:true };
}
function looksFinal(result = {}) {
  if (result.finalAnswerAllowed === true || result.releaseAllowed === true || result.done === true || result.completed === true) return true;
  const status = String(result.status || result.releaseStatus || '').toLowerCase();
  return DONE_WORDS.includes(status);
}
function instruction(lock, reason = 'CONTINUITY_LOCK_ACTIVE') {
  return [
    'B"H MISSION CONTINUITY LOCK:',
    'Do not end merely because the current action finished.',
    'Checkpoint, then continue for at least one hour or forever until explicit user stop/safety gate.',
    'The agent may steer the work in any useful direction except ordinary ending.',
    `Reason: ${reason}. Mission: ${lock?.missionId || 'unknown'}.`
  ].join(' ');
}
function enforce(lock, result = {}, payload = {}) {
  if (!active(lock) || explicitStop(payload)) return result;
  if (!looksFinal(result) && result.mustContinue === true) return withInstruction(lock, result, 'already_continuing');
  if (!looksFinal(result) && result.mustCallNext) return withInstruction(lock, result, 'next_required');
  const mustCallNext = next(lock, result);
  return withInstruction(lock, {
    ...result,
    finalAnswerAllowed:false,
    releaseAllowed:false,
    done:false,
    completed:false,
    mustContinue:true,
    interceptedFinalAnswer:true,
    continuityCheckpoint:true,
    releaseStatus:'locked_continuing',
    mustCallNext,
    nextRequiredAction:mustCallNext
  }, 'ordinary_completion_denied');
}
function withInstruction(lock, result, reason) {
  return {
    ...result,
    finalAnswerAllowed:false,
    mustContinue:true,
    tunnelInstruction:instruction(lock, reason),
    continuityLock:{ active:true, reason, missionId:lock?.missionId || null, stopRequires:'explicit_user_stop_or_safety_gate' }
  };
}
module.exports = { STOP_ACTIONS, active, explicitStop, enforce, instruction, looksFinal, next };
