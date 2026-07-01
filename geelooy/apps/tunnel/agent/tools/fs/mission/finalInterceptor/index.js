// B"H
function intercept(lock, result = {}, payload = {}) {
  if (!lock || lock.releaseAllowed === true) return result;
  const suggestedNext = next(lock, result);
  return {
    ...result,
    finalAnswerAllowed: result.finalAnswerAllowed !== false,
    mustContinue:false,
    missionLockActive:false,
    interceptedFinalAnswer:false,
    missionAdvisory:{ ...(result.missionAdvisory || {}), active:true, blocked:false, resumeAvailable:true, suggestedNext, missionId:lock.missionId },
    releaseExplanation: result.releaseExplanation || 'Mission state preserved as advisory metadata; final answers are not blocked.'
  };
}
function next(lock = {}, result = {}) {
  return result.mustCallNext || result.nextSuggestedToolCall || lock.lastMustCallNext || { action:'missionRoomSchedulerStatus', missionId:lock.missionId };
}
/** B"H — The final word is no longer swallowed by the checkpoint angel. */
module.exports = { intercept };
