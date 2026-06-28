// B"H
const Watchdog = require('../watchdog/index.js');
const Lock = require('../lock/index.js');
const Policy = require('../bootPolicy/index.js');
const Auto = require('../autoStart/index.js');
async function resume(config, payload = {}, buildActions) {
  let status = Watchdog.status(config);
  let autoStart = null;
  if (!status.active && Policy.enabled(payload)) { autoStart = await Auto.create(config, payload, buildActions); status = Watchdog.status(config); }
  if (!status.active) return { ok:true, action:'missionBootResume', resumed:false, autoStart, reason:'no_active_lock' };
  const tick = payload.tick === false || payload.tick === 'false' ? null : await Watchdog.tick(config, payload, buildActions);
  const lock = Lock.active(config);
  return { ok:true, action:'missionBootResume', resumed:true, autoStart, status, tick, lock, finalAnswerAllowed:false, mustContinue:true, mustCallNext:tick?.mustCallNext || status.mustCallNext };
}
module.exports = { resume };
