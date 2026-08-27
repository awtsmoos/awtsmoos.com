// B"H
const { clone, nowIso } = require("./state");
function generateNextAction(mission) {
  const next = clone(mission); const remaining = next.remainingWork || [];
  if (remaining.length) next.nextAction = { kind: "continue-work", summary: remaining[0], createdAt: nowIso() };
  else { const active = (next.workGraph || []).find(n => !["complete", "blocked", "superseded"].includes(n.status)); next.nextAction = active ? { kind: "resolve-work-node", summary: active.title, createdAt: nowIso() } : null; }
  next.updatedAt = nowIso(); return next;
}
module.exports = { generateNextAction };
