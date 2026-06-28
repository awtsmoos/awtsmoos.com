// B"H
/** Full removal plan. It proposes stages, never deletes. */
import fs from 'node:fs';
const cleanup = JSON.parse(fs.readFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_cleanup_ledger.json', 'utf8'));
const groups = Object.groupBy ? Object.groupBy(cleanup.rows, r => r.recommendedAction) : cleanup.rows.reduce((a,r)=>{ (a[r.recommendedAction] ||= []).push(r); return a; },{});
const plan = {
  ok:true,
  deleteNow:[],
  stages:[
    { stage:'browser-proof-required', files:[...(groups['quarantine-after-browser-proof']||[]), ...(groups['keep-out-of-phone-critical-or-move-to-archive-after-proof']||[])].map(r=>r.file) },
    { stage:'needs-owner-test-before-claim', files:[...(groups['add-owner-test-or-document-library-only']||[]), ...(groups['owner-required-before-claiming-implemented']||[])].map(r=>r.file) },
    { stage:'wire-or-mark-superseded', files:[...(groups['wire-or-mark-superseded']||[]), ...(groups['replace-references-then-deprecate']||[])].map(r=>r.file) },
    { stage:'human-review', files:[...(groups['human-review']||[])].map(r=>r.file) }
  ],
  rule:'No deletion until import-contracts, phone-critical, real-browser boot, and owner tests all pass.'
};
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_full_removal_plan.json', JSON.stringify(plan, null, 2));
console.log(JSON.stringify({ ok:true, deleteNow:0, stages:plan.stages.map(s=>({stage:s.stage,count:s.files.length})) }, null, 2));
