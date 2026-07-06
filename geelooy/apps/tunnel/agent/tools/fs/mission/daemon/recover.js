// B"H
const Lock = require('../lock/index.js');
function recover(config) {
  const lock = Lock.active(config);
  if (!lock) return advisory({ ok: true, action: 'missionDaemonRecover', recovered: false, reason: 'no_active_lock' });
  lock.recoveredAt = new Date().toISOString();
  Lock.set(config, lock);
  const nextSuggestedToolCall = lock.lastMustCallNext || { action: 'missionNext', missionId: lock.missionId };
  return advisory({ ok: true, action: 'missionDaemonRecover', recovered: true, lock, nextSuggestedToolCall, missionAdvisory:{ active:true, blocked:false, resumeAvailable:true, suggestedNext:nextSuggestedToolCall, missionId:lock.missionId } });
}
function advisory(out = {}) { return { ...out, finalAnswerAllowed:true, mustContinue:false, userVisibleAnswerBlocked:false }; }
module.exports = { recover, advisory };
