// B"H
/** TechnicalDebtRankingAudit: risk times reachability times importance becomes priority. */
import fs from 'node:fs';
const graph=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_import_graph.json','utf8'));
const cleanup=JSON.parse(fs.readFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_cleanup_ledger.json','utf8'));
const inCount=new Map(); const outCount=new Map();
for(const e of graph.edges.filter(e=>e.internal)){inCount.set(e.to,(inCount.get(e.to)||0)+1);outCount.set(e.from,(outCount.get(e.from)||0)+1);}
const rows=cleanup.rows.map(r=>{const risk=r.classification.includes('prototype')?7:r.classification.includes('alternate')?6:r.classification.includes('dormant')?3:2;const reach=(inCount.get(r.file)||0)+(outCount.get(r.file)||0);const importance=r.classification.includes('starter')?8:r.classification.includes('library')?5:3;return{file:r.file,classification:r.classification,risk,reach,importance,priority:risk*(reach+1)*importance};}).sort((a,b)=>b.priority-a.priority);
const report={ok:true,top:rows.slice(0,25),rows};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_technical_debt_ranking.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,total:rows.length,top:rows.slice(0,5).map(r=>({file:r.file,priority:r.priority}))},null,2));
