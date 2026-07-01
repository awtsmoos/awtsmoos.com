// B"H
const Policy = require('./policy.js');
const Create = require('./create.js');
async function maybeStart(config, payload = {}, active = null) {
  if (active || !Policy.shouldBoot(payload)) return null;
  return Create.start(config, payload);
}
function annotate(result = {}, boot = null) {
  if (!boot) return result;
  const next = boot.mustCallNext || null;
  return {
    ...result,
    finalAnswerAllowed: result.finalAnswerAllowed !== false,
    implicitMissionBoot: { missionId:boot.mission.id, reason:'explicit_mission_opt_in', bootMessage:boot.bootMessage },
    missionStatus: { active:true, advisory:true, implicit:true, missionId:boot.mission.id, objective:boot.mission.goal, resumeAvailable:true, suggestedNext:next },
    missionAdvisory: { resumeAvailable:true, suggestedNext:next, note:'Mission booted as durable memory only; foreground work is not blocked.' },
    agentGuidance: { ...(result.agentGuidance || {}), canSteer:true }
  };
}
/** B"H — Mission memory may wake, but it now walks behind the worker. */
module.exports = { ...Policy, ...Create, maybeStart, annotate };
