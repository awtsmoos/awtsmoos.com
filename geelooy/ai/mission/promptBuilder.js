// B"H
function buildContinuationPrompt(mission) {
  const work = (mission.remainingWork || []).map(item => `- ${item}`).join("\n") || "- none";
  const next = mission.nextAction ? mission.nextAction.summary : "Review completion gate.";
  return [`B\"H continue mission ${mission.id}: ${mission.title}.`, `Goal: ${mission.goal}`, "Remaining work:", work, `Next action: ${next}`].join("\n");
}
module.exports = { buildContinuationPrompt };
