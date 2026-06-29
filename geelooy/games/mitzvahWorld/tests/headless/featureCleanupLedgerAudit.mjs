// B"H
/**
 * FeatureCleanupLedgerAudit
 *
 * Builds a preservation-first ledger. The ledger does not delete; it names the
 * vessel. Live owners remain live, libraries remain libraries, dormant content
 * stays intentionally disabled, and prototypes wait for browser proof before
 * any archive move.
 */
import fs from 'node:fs';

const src = 'AI_THOUGHTS/feature_connectivity_reports/latest_feature_classification.json';
const data = JSON.parse(fs.readFileSync(src, 'utf8'));

const actionFor = row => {
  const c = row.classification;
  if (c === 'starter-zone-owned-passive-catalog') return 'owned-by-starter-bootstrap';
  if (c === 'compatibility-shim-superseded-by-village-activity-scheduler') return 'keep-compatibility-shim-no-new-owner';
  if (c === 'generated-feature-pack-prototype') return 'quarantine-after-browser-proof';
  if (c === 'alternate-universe-stack-not-browser-critical') return 'keep-out-of-phone-critical-or-move-to-archive-after-proof';
  if (c === 'library-only-smoke-owned-verified-contract') return 'keep-library-only-smoke-owned';
  if (c === 'library-only-owner-contract-verified') return 'keep-library-only-owner-contract-verified';
  if (c === 'intentionally-disabled-dormant-content-contract') return 'keep-intentionally-disabled-dormant-contract';
  if (c === 'superseded-by-village-activity-scheduler') return 'replace-references-then-deprecate';
  if (c.includes('registry-present')) return 'wire-or-mark-superseded';
  if (c === 'library-or-lazy-runtime-needs-owner') return 'add-owner-test-or-document-library-only';
  if (c === 'test-or-simulation-only') return 'keep-test-only';
  if (c.includes('not-connected')) return 'owner-required-before-claiming-implemented';
  return 'human-review';
};

const rows = data.rows.map(row => ({ ...row, recommendedAction:actionFor(row), deleteNow:false }));
const summary = rows.reduce((acc, row) => { acc[row.recommendedAction] = (acc[row.recommendedAction] || 0) + 1; return acc; }, {});
const ledger = { ok:true, deleteNow:0, total:rows.length, summary, rows };
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_cleanup_ledger.json', JSON.stringify(ledger, null, 2));
console.log(JSON.stringify({ ok:true, total:ledger.total, deleteNow:0, summary }, null, 2));
