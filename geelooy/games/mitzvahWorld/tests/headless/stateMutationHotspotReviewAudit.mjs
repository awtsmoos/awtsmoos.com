// B"H
/** StateMutationHotspotReviewAudit: top state touchpoints become reviewed risk rows. */
import fs from 'node:fs';
const state=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_state_mutation_audit.json','utf8'));
function bucket(file){if(file.startsWith('tests/'))return 'test-only'; if(file.startsWith('tools/'))return 'tooling'; if(file==='index.js')return 'boot-global-vessel'; if(file.includes('/ui/'))return 'ui-state'; if(file.includes('Worker'))return 'worker-bridge'; if(file.includes('/systems/tutorial/'))return 'starter-runtime'; return 'runtime';}
const rows=(state.rows||[]).slice(0,10).map(row=>({ ...row, bucket:bucket(row.file), risk: row.file==='index.js'?'medium-global-entrypoint':'review', deleteReady:false, next:'Review ownership before changing; counts are lexical, not bug proof.' }));
const report={ok:true,totalReviewed:rows.length,rows};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_state_mutation_hotspot_review.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,totalReviewed:rows.length,files:rows.map(r=>r.file)},null,2));
