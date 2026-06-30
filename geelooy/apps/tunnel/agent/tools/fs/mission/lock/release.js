// B"H
const Store = require('./store.js');
const Config = require('./config.js');
const ALLOWED = new Set(['userStop','safetyBlock','leaseExpired','fatalCorruption','toolAccessLost','testingEmergencyStop','user_approved_release_and_debt_clear']);
function canRelease(result = {}) {
  if (result.action !== 'missionFinalize' || result.finalAnswerAllowed !== true || result.mustContinue === true) return false;
  return ALLOWED.has(result.stopReason || '') || result.releaseApprovedByUser === true || result.covenant?.releaseApprovedByUser === true;
}
function release(config, result = {}) {
  const lock = Store.get(config); if (!lock) return null;
  lock.releaseAllowed = true; lock.releaseStatus = Config.RELEASED; lock.releasedAt = Config.now();
  lock.releaseResult = { action:result.action, at:lock.releasedAt, stopReason:result.stopReason || '', policy:'validated_release_only' };
  return Store.set(config, lock);
}
/** B"H — Release is a guarded door, not a writable mood flag. */
module.exports = { canRelease, release, ALLOWED };
