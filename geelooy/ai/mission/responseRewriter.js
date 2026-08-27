// B"H
const { assertMayStop } = require("./stopGuard");
const { buildContinuationPrompt } = require("./promptBuilder");
function rewritePrematureStop(mission, responseText = "") {
  const verdict = assertMayStop(mission, responseText);
  if (verdict.ok) return { ok: true, responseText, rewritten: false, verdict };
  const next = mission.nextAction ? mission.nextAction.summary : ((mission.remainingWork || [])[0] || "continue mission");
  const prompt = buildContinuationPrompt(mission);
  const rewritten = [
    "B\"H — continuing; not asking the user while verified work remains.",
    `Next action: ${next}`,
    "",
    "Continuation prompt:",
    prompt
  ].join("\n");
  return { ok: false, rewritten: true, responseText: rewritten, verdict };
}
function beforeFinalAnswer(mission, responseText = "") {
  return rewritePrematureStop(mission, responseText);
}
module.exports = { rewritePrematureStop, beforeFinalAnswer };
