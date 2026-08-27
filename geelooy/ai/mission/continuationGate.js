// B"H
const { activeNodes } = require("./workGraph");
const { latestReview } = require("./selfReview");
const { generateNextAction } = require("./nextAction");
function evaluateCompletionGate(mission) {
  const failures = [];
  if ((mission.remainingWork || []).length) failures.push("remainingWork is not empty");
  if (mission.nextAction) failures.push("nextAction is not null");
  if (activeNodes(mission).length) failures.push("active workGraph nodes remain");
  const review = latestReview(mission);
  if (!review) failures.push("latest selfReview is missing");
  if (review && review.requiredFixes.length) failures.push("latest selfReview has required fixes");
  const delta = (mission.deltas || [])[mission.deltas.length - 1];
  if (delta && (delta.missing || []).length) failures.push("latest delta has missing work");
  if (!(mission.handoffs || []).length) failures.push("handoff note missing");
  if (!(mission.checkpoints || []).length) failures.push("checkpoint missing");
  if (!mission.routeExpectation) failures.push("correlation assumptions unavailable");
  return { ok: failures.length === 0, failures };
}
function requireNextAction(mission) { return evaluateCompletionGate(mission).ok ? mission : generateNextAction(mission); }
module.exports = { evaluateCompletionGate, requireNextAction };
