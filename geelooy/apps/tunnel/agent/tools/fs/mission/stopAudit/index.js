// B"H
const Store = require('./store.js');
const Covenant = require('../continuationCovenant.js');
function isEmergency(result = {}) { return Covenant.exceptionStop(result) || result.stopReason; }
function after(config, lock, result = {}) {
  if (!lock) return null;
  if (result.interceptedFinalAnswer) return Store.record(config, lock, result, 'intercepted_final');
  if (isEmergency(result)) return Store.record(config, lock, result, 'emergency_stop');
  return null;
}
/** B"H — Stop attempts become receipts, not forgotten moods. */
module.exports = { after, list:Store.list, isEmergency };
