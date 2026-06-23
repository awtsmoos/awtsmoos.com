// B"H
const { advanceMission, finalizeSlice, shouldContinue } = require("./missionRunner");
const { beforeFinalAnswer } = require("./responseRewriter");
const { classifyBlocker } = require("./blockerClassifier");
function safeAutonomousDefaults(mission) {
  return [
    "inspect current files or state",
    "run the smallest relevant read-only test",
    "write checkpoint and handoff",
    "generate nextAction",
    `continue with: ${mission.nextAction ? mission.nextAction.summary : ((mission.remainingWork || [])[0] || "mission work")}`
  ];
}
function runMissionSlice(mission, event = {}, options = {}) {
  let next = advanceMission(mission, event);
  if (event.blocker) {
    const blocker = classifyBlocker(event.blocker);
    if (blocker.blocked && (blocker.safeActionsTried || []).length) {
      next.status = "blocked";
      next.blockers = [...(next.blockers || []), blocker];
    }
  }
  if (options.finalize !== false) next = finalizeSlice(next, options);
  return next;
}
function guardFinalResponse(mission, text) {
  return beforeFinalAnswer(mission, text);
}
module.exports = { safeAutonomousDefaults, runMissionSlice, guardFinalResponse, shouldContinue };
