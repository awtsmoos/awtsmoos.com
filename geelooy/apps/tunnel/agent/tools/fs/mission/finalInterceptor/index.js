// B"H
function intercept(lock, result = {}) { if (!lock || lock.releaseAllowed === true) return result; if (result.finalAnswerAllowed !== true) return result; return { ...result, finalAnswerAllowed:false, mustContinue:true, interceptedFinalAnswer:true, mustCallNext: result.mustCallNext || lock.lastMustCallNext || { action:'missionNext', missionId:lock.missionId } }; }
module.exports = { intercept };
