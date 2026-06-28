// B"H
/** DependencyInstabilityAudit: fan-in and fan-out show which vessels shake the bridge. */
import fs from 'node:fs';
const graph=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_import_graph.json','utf8'));
const map=new Map();
for(const e of graph.edges.filter(e=>e.internal)){map.set(e.from,map.get(e.from)||{file:e.from,fanIn:0,fanOut:0,instability:0});map.set(e.to,map.get(e.to)||{file:e.to,fanIn:0,fanOut:0,instability:0});map.get(e.from).fanOut++;map.get(e.to).fanIn++;}
const rows=[...map.values()].map(r=>({...r,instability:r.fanOut/(r.fanIn+r.fanOut||1)})).sort((a,b)=>(b.fanIn+b.fanOut)-(a.fanIn+a.fanOut));
const report={ok:true,rows:rows.slice(0,500),top:rows.slice(0,25)};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_dependency_instability.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,total:rows.length,top:report.top.slice(0,3)},null,2));
