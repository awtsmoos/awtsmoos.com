// B"H
/** @file KingdomHeadlessProof.js @description Headless proof reads kingdom summary without optional syntax. */
function summaryOf(report) { return report && report.kingdom && report.kingdom.summary ? report.kingdom.summary : {}; }
function proofOf(summary) { return summary && summary.proof ? summary.proof : {}; }
function budgetOf(summary) { return summary && summary.budget ? summary.budget : {}; }
function spatialOf(summary) { return summary && summary.spatial ? summary.spatial : {}; }
function snapshotOf(summary) { return summary && summary.snapshot ? summary.snapshot : {}; }
export function kingdomHeadlessProof(report = {}) {
  const s = summaryOf(report), proof = proofOf(s), budget = budgetOf(s), spatial = spatialOf(s), snapshot = snapshotOf(s);
  return { ok:Boolean(s.ok && s.chunks > 0 && proof.failed === 0), checks:{ chunks:s.chunks > 0, budget:Boolean(budget.mode), spatial:(spatial.buckets || 0) > 0, proof:proof.failed === 0, snapshot:Boolean(snapshot.version) }, summary:s };
}
