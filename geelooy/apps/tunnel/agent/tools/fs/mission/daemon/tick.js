// B"H
const Lock = require('../lock/index.js');
const Config = require('./config.js');
async function tick(config, payload = {}, buildActions) {
  const lock = Lock.active(config);
  if (!lock) return { ok:true, action:'missionDaemonTick', active:false, reason:'no_active_lock' };
  const p = Config.policy(payload);
  const next = lock.lastMustCallNext || { action:'missionNext', missionId:lock.missionId, auto:true };
  if (lock.blockedOn && !p.autoAnswer) return paused(lock);
  const request = { ...next, action:next.action, missionId:next.missionId || lock.missionId, ignoreMissionLock:true };
  const fn = buildActions(config, request)[request.action];
  if (!fn) return { ok:false, action:'missionDaemonTick', error:'unknown_next_action', mustCallNext:request };
  const result = await fn();
  if (result.mustCallNext || result.nextRequiredAction) Lock.update(config, result, request); else Lock.after(config, request, result);
  const active = Lock.active(config);
  return { ok:result.ok !== false, action:'missionDaemonTick', ticked:true, ranAction:request.action, resultAction:result.action, mustCallNext:result.mustCallNext || active?.lastMustCallNext || null, finalAnswerAllowed:false, mustContinue:true, receipt:{ at:new Date().toISOString(), action:request.action } };
}
function paused(lock) { return { ok:true, action:'missionDaemonTick', active:true, paused:true, reason:'gate_requires_answer', blockedOn:lock.blockedOn, mustCallNext:lock.lastMustCallNext, finalAnswerAllowed:false, mustContinue:true }; }
module.exports = { tick };
