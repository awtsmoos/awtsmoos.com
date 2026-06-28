// B"H
/** DeadAbstractionAudit: names possible one-use abstractions for human review only. */
import fs from 'node:fs';
const graph=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_import_graph.json','utf8'));
const incoming=new Map();for(const e of graph.edges.filter(e=>e.internal))incoming.set(e.to,(incoming.get(e.to)||0)+1);
const candidates=[...incoming.entries()].filter(([file,count])=>count===1&&/(Adapter|Bridge|Registry|Manager|Policy|Factory)\.js$/.test(file)).map(([file,count])=>({file,incoming:count,action:'review-not-delete'}));
const report={ok:true,candidatesCount:candidates.length,candidates:candidates.slice(0,200)};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_dead_abstraction_candidates.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,candidatesCount:candidates.length},null,2));
