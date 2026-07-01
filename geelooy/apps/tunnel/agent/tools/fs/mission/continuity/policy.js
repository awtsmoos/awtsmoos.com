// B"H
const STOP_ACTIONS = new Set(['missionStop', 'missionFinalize', 'missionProtocolFinalizeCheck']);
const DONE_WORDS = ['complete', 'completed', 'done', 'finished', 'final', 'success'];
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
  return DONE_WORDS.includes(String(result.status || result.releaseStatus || '').toLowerCase());
}
function instruction(lock, reason = 'MISSION_ADVISORY_ACTIVE') {
  return [`B"H MISSION ADVISORY:`, `Resume is available but not required.`, `Reason: ${reason}. Mission: ${lock?.missionId || 'unknown'}.`].join(' ');
}
function enforce(lock, result = {}, payload = {}) {
  if (!active(lock) || explicitStop(payload)) return result;
  const suggestedNext = next(lock, result);
  return {
    ...result,
    finalAnswerAllowed: result.finalAnswerAllowed !== false,
    releaseAllowed: result.releaseAllowed !== false,
    mustContinue:false,
    interceptedFinalAnswer:false,
    continuityCheckpoint: looksFinal(result),
    releaseStatus: result.releaseStatus || 'advisory_resume_available',
    nextSuggestedAction:suggestedNext,
    tunnelInstruction:instruction(lock, 'ordinary_completion_allowed'),
    continuityLock:{ active:false, reason:'mission_is_advisory', missionId:lock?.missionId || null, stopRequires:'no_special_gate' },
    missionAdvisory:{ active:true, blocked:false, resumeAvailable:true, suggestedNext, missionId:lock?.missionId || null }
  };
}
module.exports = { STOP_ACTIONS, active, explicitStop, enforce, instruction, looksFinal, next };
