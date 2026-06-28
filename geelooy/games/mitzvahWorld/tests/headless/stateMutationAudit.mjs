// B"H
/** StateMutationAudit: who writes, who serializes, who touches global state. */
import fs from 'node:fs';
const graph=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_import_graph.json','utf8'));
const files=[...new Set(graph.edges.flatMap(e=>[e.from,e.to]).filter(f=>fs.existsSync(f)))];
const rows=files.map(file=>{const t=fs.readFileSync(file,'utf8');return{file,localStorage:(t.match(/localStorage/g)||[]).length,globalThis:(t.match(/globalThis|window\./g)||[]).length,jsonStringify:(t.match(/JSON\.stringify/g)||[]).length,assignments:(t.match(/\bstore\.[A-Za-z0-9_]+\s*=|\bstate\.[A-Za-z0-9_]+\s*=/g)||[]).length};}).filter(r=>r.localStorage||r.globalThis||r.jsonStringify||r.assignments).sort((a,b)=>(b.localStorage+b.globalThis+b.jsonStringify+b.assignments)-(a.localStorage+a.globalThis+a.jsonStringify+a.assignments));
const report={ok:true,rows:rows.slice(0,300)};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_state_mutation_audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,rows:rows.length,top:rows.slice(0,3)},null,2));
