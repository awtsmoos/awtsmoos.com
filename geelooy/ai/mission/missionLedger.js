// B"H
const { clone, nowIso } = require("./state");
function addRemainingWork(mission, items = []) {
  const next = clone(mission); const incoming = Array.isArray(items) ? items : [items]; const merged = new Set(next.remainingWork || []);
  incoming.filter(Boolean).map(String).forEach(item => merged.add(item)); next.remainingWork = [...merged]; next.updatedAt = nowIso(); return next;
}
function completeRemainingWork(mission, item) { const next = clone(mission); next.remainingWork = (next.remainingWork || []).filter(work => work !== item); next.updatedAt = nowIso(); return next; }
function addDelta(mission, planned, actual, missing = []) { const next = clone(mission); next.deltas.push({ planned, actual, missing, createdAt: nowIso() }); next.updatedAt = nowIso(); return next; }
module.exports = { addRemainingWork, completeRemainingWork, addDelta };
