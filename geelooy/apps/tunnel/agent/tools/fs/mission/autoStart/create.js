// B"H
const Policy = require('../bootPolicy/index.js');
const Lock = require('../lock/index.js');
const Harvester = require('../evidenceHarvester/index.js');
async function create(config, payload = {}, buildActions) {
  const p = { action:'missionStart', goal:Policy.goal(payload), autoSeedNext8:true, minimumRuntimeMs:Policy.runtimeMs(payload), metadata:{ source:'boot_auto_mission', projectRoot:config.root }, ignoreMissionLock:true };
  const fn = buildActions(config, p).missionStart;
  if (!fn) return { ok:false, action:'missionAutoStart', error:'missionStart_unavailable' };
  const result = await fn();
  const lock = Lock.start(config, result, p);
  const harvest = lock ? await Harvester.run(config, lock, payload, buildActions) : null;
  return { ok:result.ok !== false && !!lock, action:'missionAutoStart', started:!!lock, missionId:lock?.missionId || result.missionId || result.mission?.id, harvest, lock, result };
}
module.exports = { create };
