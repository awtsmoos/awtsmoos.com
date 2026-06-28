// B"H
/** Builds an actionable cleanup ledger without deleting anything. */
import fs from 'node:fs';
const src = 'AI_THOUGHTS/feature_connectivity_reports/latest_feature_classification.json';
const data = JSON.parse(fs.readFileSync(src, 'utf8'));
const actionFor = row => {
  const c = row.classification;
  if (c === 'starter-zone-owned-passive-catalog') return 'owned-by-starter-bootstrap';
  if (c === 'compatibility-shim-superseded-by-village-activity-scheduler') return 'keep-compatibility-shim-no-new-owner';
  if (c === 'generated-feature-pack-prototype') return 'quarantine-after-browser-proof';
  if (c === 'alternate-universe-stack-not-browser-critical') return 'keep-out-of-phone-critical-or-move-to-archive-after-proof';
  if (c === 'superseded-by-village-activity-scheduler') return 'replace-references-then-deprecate';
  if (c.includes('not-connected')) return 'owner-required-before-claiming-implemented';
  if (c.includes('registry-present')) return 'wire-or-mark-superseded';
  if (c === 'library-or-lazy-runtime-needs-owner') return 'add-owner-test-or-document-library-only';
  if (c === 'test-or-simulation-only') return 'keep-test-only';
  return 'human-review';
};
const rows = data.rows.map(row => ({ ...row, recommendedAction: actionFor(row), deleteNow:false }));
const summary = rows.reduce((a,r)=>{ a[r.recommendedAction]=(a[r.recommendedAction]||0)+1; return a; },{});
const ledger = { ok:true, deleteNow:0, total:rows.length, summary, rows };
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_cleanup_ledger.json', JSON.stringify(ledger, null, 2));
console.log(JSON.stringify({ ok:true, total:ledger.total, deleteNow:0, summary }, null, 2));
