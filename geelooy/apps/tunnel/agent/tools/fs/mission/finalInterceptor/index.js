// B"H
const Covenant = require('../continuationCovenant.js');
function intercept(lock, result = {}, payload = {}) {
  if (!lock || lock.releaseAllowed === true) return result;
  if (Covenant.exceptionStop(payload) || Covenant.exceptionStop(result)) return result;
  if (result.finalAnswerAllowed !== true) return attachIfNeeded(lock, result);
  return { ...result, ...Covenant.blockedResponse(lock, result, next(lock, result)),
    interceptedFinalAnswer:true,
    releaseExplanation:'A final answer was treated as a checkpoint because the mission lock is still active.' };
}
function attachIfNeeded(lock, result) {
  if (result.mustContinue !== true && result.finalAnswerAllowed !== false) return result;
  return { ...result, ...Covenant.blockedResponse(lock, result, next(lock, result)) };
}
function next(lock = {}, result = {}) {
  return result.mustCallNext || lock.lastMustCallNext || { action:'missionRoomSchedulerStatus', missionId:lock.missionId };
}
module.exports = { intercept };
