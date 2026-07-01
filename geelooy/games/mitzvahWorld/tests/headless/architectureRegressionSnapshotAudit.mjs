// B"H
/**
 * ArchitectureRegressionSnapshotAudit
 *
 * Freezes today's architecture metrics so tomorrow can be compared. If the
 * dashboard has not yet been gathered in this command chain, the snapshot audit
 * gathers the same candles itself, then records the moment without pretending
 * that absent generated files are architectural failures.
 */
import fs from 'node:fs';

const reportsDir = 'AI_THOUGHTS/architecture_reports';
const connectivityDir = 'AI_THOUGHTS/feature_connectivity_reports';
const dashboardPath = `${reportsDir}/latest_architecture_health_dashboard.json`;

function readJson(path, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(path, 'utf8')); }
  catch { return fallback; }
}

function dashboardFromReports() {
  const graph = readJson(`${reportsDir}/latest_import_graph.json`);
  const boundary = readJson(`${reportsDir}/latest_system_boundary_audit.json`);
  const owner = readJson(`${reportsDir}/latest_runtime_ownership_graph.json`);
  const cleanup = readJson(`${connectivityDir}/latest_feature_cleanup_ledger.json`);
  const full = readJson(`${connectivityDir}/latest_full_removal_plan.json`);
  const prototype = readJson(`${connectivityDir}/latest_prototype_boot_isolation_audit.json`);
  const maturity = readJson(`${reportsDir}/latest_feature_maturity_index.json`);
  const deletion = readJson(`${reportsDir}/latest_deletion_confidence.json`);
  const debt = readJson(`${reportsDir}/latest_technical_debt_ranking.json`);
  const dead = readJson(`${reportsDir}/latest_dead_abstraction_candidates.json`);
  const state = readJson(`${reportsDir}/latest_state_mutation_audit.json`);
  const tiers = readJson(`${reportsDir}/latest_browser_evidence_tiers.json`);
  const metrics = {
    modules: graph.fileCount || 0,
    importEdges: graph.edgeCount || 0,
    unreachableNonTest: graph.unreachableCount || 0,
    boundaryViolations: boundary.criticalViolations?.length || 0,
    monitoredBoundaryCrossings: boundary.monitoredCrossings?.length || 0,
    ownerlessClaims: owner.ownerlessClaims?.length || 0,
    duplicateOwners: owner.duplicateOwners?.length || 0,
    prototypeFiles: cleanup.summary?.['quarantine-after-browser-proof'] || 0,
    alternateUniverseFiles: cleanup.summary?.['keep-out-of-phone-critical-or-move-to-archive-after-proof'] || 0,
    deletionReady: deletion.deleteReady || full.deleteNow?.length || 0,
    removalBlockers: full.blockerCount || 0,
    prototypeBootViolations: prototype.violations?.length || 0,
    featureMaturityAverage: maturity.average || 0,
    deadAbstractionCandidates: dead.candidatesCount || 0,
    stateMutationRows: state.rows?.length || 0,
    topDebtPriority: debt.top?.[0]?.priority || 0,
    currentBrowserEvidenceTier: tiers.currentMaxTier ?? 0,
    realChromeAvailable: Boolean(tiers.chromeAvailable)
  };
  const ok = metrics.boundaryViolations === 0 && metrics.ownerlessClaims === 0 && metrics.duplicateOwners === 0 && metrics.deletionReady === 0 && metrics.removalBlockers === 0 && metrics.prototypeBootViolations === 0;
  return { ok, metrics, topDebt:debt.top?.slice(0, 5) || [], notes:['Auto-built by ArchitectureRegressionSnapshotAudit because dashboard had not yet run in this command chain.'] };
}

fs.mkdirSync(`${reportsDir}/snapshots`, { recursive:true });
const dashboard = fs.existsSync(dashboardPath) ? readJson(dashboardPath) : dashboardFromReports();
if (!fs.existsSync(dashboardPath)) fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
const snapshot = { ok:true, createdAt:new Date().toISOString(), metrics:dashboard.metrics || {} };
const file = `${reportsDir}/snapshots/${snapshot.createdAt.replace(/[:.]/g, '-')}.json`;
fs.writeFileSync(file, JSON.stringify(snapshot, null, 2));
fs.writeFileSync(`${reportsDir}/latest_architecture_regression_snapshot.json`, JSON.stringify({ ...snapshot, file }, null, 2));
console.log(JSON.stringify({ ok:true, file, metrics:snapshot.metrics }, null, 2));
