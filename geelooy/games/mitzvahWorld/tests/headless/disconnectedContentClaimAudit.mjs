// B"H
/**
 * DisconnectedContentClaimAudit
 * Makes uncertainty explicit: content runtimes not connected to the phone-critical
 * starting-zone path are not allowed to be claimed fully implemented.
 */
import fs from 'node:fs';
const ledger = JSON.parse(fs.readFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_cleanup_ledger.json','utf8'));
const blockedActions = new Set(['owner-required-before-claiming-implemented','wire-or-mark-superseded','human-review']);
const rows = ledger.rows.filter(r => blockedActions.has(r.recommendedAction)).map(r => ({ file:r.file, action:r.recommendedAction, claim:'not-claimed-implemented', deleteNow:false }));
const report = { ok:true, total:rows.length, rows };
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_disconnected_content_claims.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok:true, notClaimedImplemented:rows.length }, null, 2));
