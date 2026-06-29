// B"H
/** TopDebtInvestigationAudit: explains Feature49 and AnimalRuntime with import evidence. */
import fs from 'node:fs';
const debt=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_technical_debt_ranking.json','utf8'));
const graph=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_import_graph.json','utf8'));
const targets=['ckidsAwtsmoos/systems/feature49/Feature49Runtime.js','systems/universe/animals/AnimalRuntime.js','ckidsAwtsmoos/systems/feature100/Feature100Runtime.js'];
const rows=targets.map(file=>{
  const source=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
  const imports=graph.edges.filter(e=>e.from===file).map(e=>e.to);
  const importers=graph.edges.filter(e=>e.to===file).map(e=>e.from);
  const debtRow=(debt.rows||[]).find(r=>r.file===file)||null;
  const classification=debtRow?.classification || (file.includes('feature')?'generated-feature-pack-prototype':'alternate-universe-stack-not-browser-critical');
  return {file,classification,debt:debtRow,imports,importers,lines:source.split(/\r?\n/).length,decision:'preserve-not-production-claimed',next:file.includes('Feature100')?'Keep monitored shim; archive only after browser proof and replacement plan.':'Keep classified; no runtime wiring without explicit owner and browser proof.'};
});
const report={ok:true,rows};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_top_debt_investigation.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,rows:rows.map(r=>({file:r.file,imports:r.imports.length,importers:r.importers.length,classification:r.classification}))},null,2));
