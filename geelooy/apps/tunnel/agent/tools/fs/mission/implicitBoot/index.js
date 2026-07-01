// B"H
const Policy = require('./policy.js');
const Create = require('./create.js');
async function maybeStart(config, payload = {}, active = null) {
  if (active || !Policy.shouldBoot(payload)) return null;
  return Create.start(config, payload);
}
function annotate(result = {}, boot = null) {
  if (!boot) return result;
  return { ...result, implicitMissionBoot:{ missionId:boot.mission.id, reason:'meaningful_tool_work_requires_mission', bootMessage:boot.bootMessage },
    missionStatus:{ active:true, implicit:true, missionId:boot.mission.id, objective:boot.mission.goal, next:boot.mustCallNext },
    agentGuidance:{ ...(result.agentGuidance || {}), plainEnglish:`${boot.bootMessage} ${result.agentGuidance?.plainEnglish || ''}`.trim(), canSteer:true } };
}
/** B"H — If real work begins, mission memory wakes automatically. */
module.exports = { ...Policy, ...Create, maybeStart, annotate };
