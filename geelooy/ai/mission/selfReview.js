// B"H
const { clone, nowIso } = require("./state");
function reviewMission(mission) {
  const requiredFixes = [];
  if ((mission.remainingWork || []).length) requiredFixes.push("remainingWork is not empty");
  if (!(mission.evidence || []).length) requiredFixes.push("evidence ledger is empty");
  if ((mission.workGraph || []).some(node => !(node.verification || []).length)) requiredFixes.push("one or more work nodes lack verification");
  if (!mission.routeExpectation) requiredFixes.push("routeExpectation is unavailable");
  const review = { id: `review_${Date.now()}`, requiredFixes, createdAt: nowIso() };
  const next = clone(mission); next.selfReviews = [...(next.selfReviews || []), review]; next.updatedAt = nowIso(); return next;
}
function latestReview(mission) { const reviews = mission.selfReviews || []; return reviews[reviews.length - 1] || null; }
module.exports = { reviewMission, latestReview };
