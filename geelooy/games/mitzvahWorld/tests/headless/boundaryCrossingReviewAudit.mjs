// B"H
/** BoundaryCrossingReviewAudit: monitored crossings become named review decisions. */
import fs from 'node:fs';
const boundary=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_system_boundary_audit.json','utf8'));
const unique=new Map();
for(const row of boundary.monitoredCrossings||[]) unique.set(`${row.from}->${row.to}:${row.reason}`, row);
const rows=[...unique.values()].map(row=>({
  ...row,
  decision: row.reason==='prototype-imports-live-owner-monitor-before-archive' ? 'keep-monitored-compatibility-wrapper' : 'keep-monitored-tooling-crossing',
  productionClaim:false,
  next:'Do not remove or wire further without browser proof and explicit owner migration.'
}));
const report={ok:true,total:rows.length,rows};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_boundary_crossing_review.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,total:rows.length,decisions:rows.map(r=>r.decision)},null,2));
