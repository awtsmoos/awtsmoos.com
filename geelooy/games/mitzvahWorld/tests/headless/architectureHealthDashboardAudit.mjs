// B"H
/** ArchitectureHealthDashboardAudit: one window where the scattered candles gather. */
import fs from 'node:fs';
function j(p,fallback={}){try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch{return fallback;}}
const graph=j('AI_THOUGHTS/architecture_reports/latest_import_graph.json');
const boundary=j('AI_THOUGHTS/architecture_reports/latest_system_boundary_audit.json');
const owner=j('AI_THOUGHTS/architecture_reports/latest_runtime_ownership_graph.json');
const cleanup=j('AI_THOUGHTS/feature_connectivity_reports/latest_feature_cleanup_ledger.json');
const full=j('AI_THOUGHTS/feature_connectivity_reports/latest_full_removal_plan.json');
const prototype=j('AI_THOUGHTS/feature_connectivity_reports/latest_prototype_boot_isolation_audit.json');
const maturity=j('AI_THOUGHTS/architecture_reports/latest_feature_maturity_index.json');
const deletion=j('AI_THOUGHTS/architecture_reports/latest_deletion_confidence.json');
const debt=j('AI_THOUGHTS/architecture_reports/latest_technical_debt_ranking.json');
const dead=j('AI_THOUGHTS/architecture_reports/latest_dead_abstraction_candidates.json');
const state=j('AI_THOUGHTS/architecture_reports/latest_state_mutation_audit.json');
const tiers=j('AI_THOUGHTS/architecture_reports/latest_browser_evidence_tiers.json');
const metrics={
  modules:graph.fileCount||0,
  importEdges:graph.edgeCount||0,
  unreachableNonTest:graph.unreachableCount||0,
  boundaryViolations:boundary.criticalViolations?.length||0,
  monitoredBoundaryCrossings:boundary.monitoredCrossings?.length||0,
  ownerlessClaims:owner.ownerlessClaims?.length||0,
  duplicateOwners:owner.duplicateOwners?.length||0,
  prototypeFiles:cleanup.summary?.['quarantine-after-browser-proof']||0,
  alternateUniverseFiles:cleanup.summary?.['keep-out-of-phone-critical-or-move-to-archive-after-proof']||0,
  deletionReady:deletion.deleteReady||full.deleteNow?.length||0,
  removalBlockers:full.blockerCount||0,
  prototypeBootViolations:prototype.violations?.length||0,
  featureMaturityAverage:maturity.average||0,
  deadAbstractionCandidates:dead.candidatesCount||0,
  stateMutationRows:state.rows?.length||0,
  topDebtPriority:debt.top?.[0]?.priority||0,
  currentBrowserEvidenceTier:tiers.currentMaxTier??0,
  realChromeAvailable:Boolean(tiers.chromeAvailable)
};
const ok=metrics.boundaryViolations===0&&metrics.ownerlessClaims===0&&metrics.duplicateOwners===0&&metrics.deletionReady===0&&metrics.removalBlockers===0&&metrics.prototypeBootViolations===0;
const report={ok,metrics,topDebt:debt.top?.slice(0,5)||[],notes:['Headless/node proof is not real browser FPS proof.','Prototype and alternate stack remain preserved, not production-claimed.','Unreachable count and dead abstractions are informational until reviewed; they are not deletion proof.']};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_architecture_health_dashboard.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!ok)process.exit(1);
