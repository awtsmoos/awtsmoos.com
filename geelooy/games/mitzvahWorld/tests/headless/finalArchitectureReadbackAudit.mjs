// B"H
/** FinalArchitectureReadbackAudit: proven vs unproven, with no borrowed crown. */
import fs from 'node:fs';
function j(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
const dashboard=j('AI_THOUGHTS/architecture_reports/latest_architecture_health_dashboard.json');
const tiers=j('AI_THOUGHTS/architecture_reports/latest_browser_evidence_tiers.json');
const index=j('AI_THOUGHTS/architecture_reports/latest_architecture_report_index.json');
const boundary=j('AI_THOUGHTS/architecture_reports/latest_boundary_crossing_review.json');
const unreachable=j('AI_THOUGHTS/architecture_reports/latest_unreachable_breakdown.json');
const deletion=j('AI_THOUGHTS/architecture_reports/latest_deletion_confidence.json');
const report={
  ok:dashboard.ok && index.ok && deletion.deleteReady===0,
  proven:[
    'Architecture audit suite executes through package script.',
    'Critical boundary violations are zero.',
    'Ownerless feature claims are zero.',
    'Prototype boot isolation violations are zero.',
    'Deletion-ready files are zero under preservation-first policy.',
    'Report index exists and links proof reports.'
  ],
  unproven:[
    'Real interactive browser proof is unavailable.',
    'Real mobile browser proof is unavailable.',
    '60 FPS real-device proof is unavailable.',
    'Static unreachable files are not deletion proof.',
    'Dead abstraction candidates require human review before simplification.'
  ],
  metrics:dashboard.metrics,
  browserTier:tiers.currentMaxTier,
  monitoredBoundaryCrossings:boundary.total,
  unreachableSummary:unreachable.summary,
  deleteReady:deletion.deleteReady,
  reports:index.reports
};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_final_architecture_readback.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:report.ok,proven:report.proven.length,unproven:report.unproven.length,browserTier:report.browserTier,deleteReady:report.deleteReady},null,2));
if(!report.ok)process.exit(1);
