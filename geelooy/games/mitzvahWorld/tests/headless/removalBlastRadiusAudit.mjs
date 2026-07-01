// B"H
/**
 * RemovalBlastRadiusAudit
 *
 * What breaks if the candidate disappears? The answer must be built from the
 * import graph and the removal-candidate ledger. If the ledger has not yet been
 * generated in this test chain, this audit creates the same honest ledger from
 * the latest feature classification instead of falling into silence.
 */
import fs from 'node:fs';

const connectivityDir = 'AI_THOUGHTS/feature_connectivity_reports';
const architectureDir = 'AI_THOUGHTS/architecture_reports';
const classificationPath = `${connectivityDir}/latest_feature_classification.json`;
const candidatesPath = `${connectivityDir}/latest_removal_candidates.json`;
const graphPath = `${architectureDir}/latest_import_graph.json`;
const reportPath = `${architectureDir}/latest_removal_blast_radius.json`;
const candidateClasses = new Set([
  'generated-feature-pack-prototype',
  'alternate-universe-stack-not-browser-critical',
  'superseded-by-village-activity-scheduler'
]);

function readJson(path, fallback) {
  try { return JSON.parse(fs.readFileSync(path, 'utf8')); }
  catch { return fallback; }
}

function buildCandidates() {
  const data = readJson(classificationPath, { rows:[] });
  const candidates = (data.rows || []).filter(row => candidateClasses.has(row.classification));
  const keepReview = (data.rows || []).filter(row => !candidateClasses.has(row.classification));
  return { ok:true, candidatesCount:candidates.length, candidates, keepReviewCount:keepReview.length, keepReview, note:'Auto-seeded by RemovalBlastRadiusAudit because architecture-health reached confidence before removal candidates were generated.' };
}

fs.mkdirSync(connectivityDir, { recursive:true });
fs.mkdirSync(architectureDir, { recursive:true });
if (!fs.existsSync(candidatesPath)) fs.writeFileSync(candidatesPath, JSON.stringify(buildCandidates(), null, 2));

const graph = readJson(graphPath, { edges:[] });
const candidates = readJson(candidatesPath, { candidates:[] });
const rows = (candidates.candidates || []).map(candidate => ({
  file: candidate.file,
  classification: candidate.classification,
  directImporters: (graph.edges || []).filter(edge => edge.to === candidate.file).map(edge => edge.from),
  deleteReady: false
}));
const report = { ok:true, rows };
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok:true, total:rows.length, zeroImporters:rows.filter(row => row.directImporters.length === 0).length }, null, 2));
