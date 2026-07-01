// B"H
const Mission = require('../index.js');
const Lock = require('../lock/index.js');
const G = require('./guidance.js');
function id(payload = {}) { return `auto_${Date.now().toString(36)}_${String(payload.action || 'work').replace(/[^a-z0-9_-]/gi,'_').slice(0,32)}`; }
async function start(config, payload = {}) {
  const mission = await Mission.create(config, { id:id(payload), goal:G.goal(payload), minimumInnovationWindowMs:payload.minimumInnovationWindowMs || 3600000,
    metadata:{ implicit:true, source:'implicit_tool_action', firstAction:payload.action, projectRoot:config.root } });
  const mustCallNext = G.next(mission.id);
  const lock = Lock.start(config, { ok:true, action:'missionStart', missionId:mission.id, mission, mustCallNext }, { ...payload, owner:'implicit_mission_boot', missionLockMode:'implicit' });
  return { mission, lock, mustCallNext, bootMessage:G.message(payload) };
}
module.exports = { id, start };
