// B"H
const { nowIso, clone } = require("./state");
function addEvidence(mission, entry = {}) {
  const next = clone(mission);
  const id = entry.id || `ev_${next.evidence.length + 1}`;
  next.evidence.push({ id, kind: entry.kind || "inference", source: entry.source || "mission-engine", summary: entry.summary || "Evidence recorded", confidence: entry.confidence || "observed", createdAt: entry.createdAt || nowIso() });
  next.updatedAt = nowIso();
  return next;
}
function evidenceSummaries(mission) { return (mission.evidence || []).map(ev => `${ev.id}: ${ev.summary}`); }
module.exports = { addEvidence, evidenceSummaries };
