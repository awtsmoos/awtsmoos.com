// B"H
function nowIso() { return new Date().toISOString(); }
function randomId(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function makeMission(input = {}) {
  const stamp = nowIso();
  const remaining = Array.isArray(input.remainingWork) && input.remainingWork.length ? input.remainingWork : [input.goal || input.title || "Define mission work"];
  return {
    id: input.id || randomId("mission"), title: input.title || "Awtsmoos Mission", goal: input.goal || input.title || "Continue until verified closure", status: "active", createdAt: stamp, updatedAt: stamp,
    routeExpectation: input.routeExpectation || null, workGraph: [], remainingWork: remaining.map(String), nextAction: null, questions: [], multipleChoiceSelfInterrogations: [], evidence: [], checkpoints: [], deltas: [], handoffs: [], failures: []
  };
}
function touch(mission) { const next = clone(mission); next.updatedAt = nowIso(); return next; }
module.exports = { nowIso, randomId, clone, makeMission, touch };
