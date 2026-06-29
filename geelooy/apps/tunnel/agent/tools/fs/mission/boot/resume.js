// B"H
const Watchdog = require('../watchdog/index.js');
const Lock = require('../lock/index.js');
const Policy = require('../bootPolicy/index.js');
const Auto = require('../autoStart/index.js');
function isBoot(next = {}) { return String(next?.action || '') === 'missionBootResume'; }
function sameMission(next = {}, missionId = '') { return !next?.missionId || !missionId || String(next.missionId) === String(missionId); }
function loopCount(lock = {}) { return Number(lock.bootResumeSelfLoopCount || 0); }
function daemonNext(lock = {}, reason = 'boot_resume_self_loop_escape') { return { action: 'missionDaemonTick', missionId: lock.missionId || '', reason }; }
function markLoop(config, lock = {}, next = {}) {
  if (!lock?.missionId) return lock;
  const count = isBoot(next) && sameMission(next, lock.missionId) ? loopCount(lock) + 1 : 0;
  lock.bootResumeSelfLoopCount = count;
  lock.bootResumeSelfLoopAt = count ? new Date().toISOString() : '';
  if (count >= 2) {
    lock.lastMustCallNext = daemonNext(lock);
    lock.loopDiagnostics = {
      ...(lock.loopDiagnostics || {}),
      bootResumeSelfLoop: true,
      bootResumeSelfLoopCount: count,
      chosenEscape: 'missionDaemonTick',
      plainEnglish: 'MISSIONBOOTRESUME RETURNED ITSELF REPEATEDLY. DO NOT STOP. SWITCH TO MISSIONDAEMONTICK OR PRODUCTIVE MISSION DIAGNOSTICS.'
    };
  }
  Lock.set(config, lock);
  return lock;
}
function explainLoop(lock = {}) {
  return {
    bootResumeSelfLoop: true,
    bootResumeSelfLoopCount: loopCount(lock),
    why: 'Boot resume did not discover a fresher next action and would repeat itself.',
    whatToDo: 'CALL MISSIONDAEMONTICK NEXT, THEN CONTINUE PRODUCTIVE MISSION-SCOPE WORK WITH FULL AUTONOMY.',
    agentFreedom: 'ABSOLUTE MISSION FREEDOM INSIDE THE MISSION SYSTEM REMAINS ACTIVE.'
  };
}
async function resume(config, payload = {}, buildActions) {
  let status = Watchdog.status(config);
  let autoStart = null;
  if (!status.active && Policy.enabled(payload)) {
    autoStart = await Auto.create(config, payload, buildActions);
    status = Watchdog.status(config);
  }
  if (!status.active) return { ok: true, action: 'missionBootResume', resumed: false, autoStart, reason: 'no_active_lock', finalAnswerAllowed: false, mustContinue: false };
  const tick = payload.tick === false || payload.tick === 'false' ? null : await Watchdog.tick(config, payload, buildActions);
  let lock = Lock.active(config) || status.lock || {};
  const rawNext = tick?.mustCallNext || status.mustCallNext || lock.lastMustCallNext || null;
  lock = markLoop(config, lock, rawNext) || lock;
  const escaped = loopCount(lock) >= 2;
  const mustCallNext = escaped ? daemonNext(lock) : rawNext;
  return {
    ok: true, action: 'missionBootResume', resumed: true, autoStart, status, tick, lock,
    finalAnswerAllowed: false, mustContinue: true, mustCallNext,
    bootResumeSelfLoop: escaped,
    bootResumeDiagnostics: escaped ? explainLoop(lock) : null
  };
}
module.exports = { resume, isBoot, sameMission, loopCount, daemonNext, markLoop, explainLoop };
