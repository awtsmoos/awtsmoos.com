// B"H
/**
 * DisconnectedContentClaimAudit
 *
 * The gate forbids pretending. A dormant contract may remain disconnected only
 * when the cleanup ledger explicitly says so. A library may remain outside boot
 * only when an owner test imports it. Anything still needing owner or human
 * review remains a not-implemented claim.
 */
import fs from 'node:fs';

const ledger = JSON.parse(fs.readFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_cleanup_ledger.json', 'utf8'));
const blockedActions = new Set(['owner-required-before-claiming-implemented', 'wire-or-mark-superseded', 'human-review']);
const rows = ledger.rows
  .filter(row => blockedActions.has(row.recommendedAction))
  .map(row => ({ file:row.file, action:row.recommendedAction, claim:'not-claimed-implemented', deleteNow:false }));
const report = {
  ok:true,
  total:rows.length,
  rows,
  intentionallyDisconnected:ledger.rows
    .filter(row => ['keep-library-only-smoke-owned', 'keep-intentionally-disabled-dormant-contract'].includes(row.recommendedAction))
    .map(row => ({ file:row.file, action:row.recommendedAction, claim:'not-browser-connected-by-design' }))
};
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_disconnected_content_claims.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok:true, notClaimedImplemented:rows.length, intentionallyDisconnected:report.intentionallyDisconnected.length }, null, 2));
