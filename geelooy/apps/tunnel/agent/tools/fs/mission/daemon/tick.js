// B"H
const Lock = require('../lock/index.js');
const Config = require('./config.js');
const Lease = require('../../continuation/lease.js');
const Guide = require('./instruction.js');
function nextFor(lock) { return lock.lastMustCallNext || { action:'missionNext', missionId:lock.missionId, auto:true }; }
function requestFor(lock, next) { return { ...next, action:next.action, missionId:next.missionId || lock.missionId, ignoreMissionLock:true }; }

/**
 * B"H — A daemon tick is a heartbeat, not a verdict.
 * It follows the latest required action, records the receipt, and returns a
 * natural reminder that the room may steer instead of stopping after a command.
 */
async function tick(config, payload = {}, buildActions) {
  const lock = Lock.active(config);
  if (!lock) return { ok:true, action:'missionDaemonTick', active:false, reason:'no_active_lock' };
  const policy = Config.policy(payload);
  if (lock.blockedOn && !policy.autoAnswer) return paused(lock, policy.lease);
  const request = requestFor(lock, nextFor(lock));
  const fn = buildActions(config, request)[request.action];
  if (!fn) return blocked(request, policy.lease);
  const result = await fn();
  if (result.mustCallNext || result.nextRequiredAction) Lock.update(config, result, request);
  else Lock.after(config, request, result);
  return Lease.decorate(resultFor(config, request, result, policy.lease), policy.lease);
}
function blocked(request, lease) { return Lease.decorate(base('unknown_next_action', request, lease, false), lease); }
function paused(lock, lease) { return Lease.decorate({ ...base('gate_requires_answer', lock.lastMustCallNext, lease, true), active:true, paused:true, blockedOn:lock.blockedOn }, lease); }
function resultFor(config, request, result, lease) {
  const active = Lock.active(config);
  return { ok:result.ok !== false, action:'missionDaemonTick', ticked:true, ranAction:request.action,
    resultAction:result.action, mustCallNext:result.mustCallNext || active?.lastMustCallNext || request,
    finalAnswerAllowed:false, mustContinue:true, tunnelInstruction:Guide.instruction(lease),
    receipt:{ at:new Date().toISOString(), action:request.action } };
}
function base(reason, next, lease, ok) { return { ok, action:'missionDaemonTick', reason, error:ok ? undefined : reason, mustCallNext:next, mustContinue:true, finalAnswerAllowed:false, tunnelInstruction:Guide.instruction(lease) }; }
module.exports = { tick, instruction:Guide.instruction };
