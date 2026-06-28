// B"H
const Lock = require('../lock/index.js');
const Config = require('./config.js');
const Lease = require('../../continuation/lease.js');

function instruction(lease) {
  if (!Lease.active(lease)) return '';
  return 'YOU ARE UNDER A HARD ONE-HOUR MINIMUM CONTINUATION LOCK. DO NOT FINALIZE. DO NOT STOP. DO NOT SUMMARIZE AS FINAL. KEEP CALLING MUSTCALLNEXT OR MISSIONDAEMONTICK UNTIL minimumUntil UNLESS USER CANCELS OR SAFETY BLOCKS.';
}

function nextFor(lock) {
  return lock.lastMustCallNext || { action: 'missionNext', missionId: lock.missionId, auto: true };
}

function requestFor(lock, next) {
  return { ...next, action: next.action, missionId: next.missionId || lock.missionId, ignoreMissionLock: true };
}

async function tick(config, payload = {}, buildActions) {
  const lock = Lock.active(config);
  if (!lock) return { ok: true, action: 'missionDaemonTick', active: false, reason: 'no_active_lock' };
  const p = Config.policy(payload);
  if (lock.blockedOn && !p.autoAnswer) return paused(lock, p.lease);
  const request = requestFor(lock, nextFor(lock));
  const fn = buildActions(config, request)[request.action];
  if (!fn) return blocked(request, p.lease);
  const result = await fn();
  if (result.mustCallNext || result.nextRequiredAction) Lock.update(config, result, request);
  else Lock.after(config, request, result);
  return Lease.decorate(resultFor(config, request, result, p.lease), p.lease);
}

function blocked(request, lease) {
  return Lease.decorate({
    ok: false,
    action: 'missionDaemonTick',
    error: 'unknown_next_action',
    mustCallNext: request,
    mustContinue: true,
    finalAnswerAllowed: false,
    tunnelInstruction: instruction(lease)
  }, lease);
}

function resultFor(config, request, result, lease) {
  const active = Lock.active(config);
  return {
    ok: result.ok !== false,
    action: 'missionDaemonTick',
    ticked: true,
    ranAction: request.action,
    resultAction: result.action,
    mustCallNext: result.mustCallNext || active?.lastMustCallNext || nextFor(active || {}),
    finalAnswerAllowed: false,
    mustContinue: true,
    tunnelInstruction: instruction(lease),
    receipt: { at: new Date().toISOString(), action: request.action }
  };
}

function paused(lock, lease) {
  return Lease.decorate({
    ok: true,
    action: 'missionDaemonTick',
    active: true,
    paused: true,
    reason: 'gate_requires_answer',
    blockedOn: lock.blockedOn,
    mustCallNext: lock.lastMustCallNext,
    finalAnswerAllowed: false,
    mustContinue: true,
    tunnelInstruction: instruction(lease)
  }, lease);
}

module.exports = { tick, instruction };
