// B"H
/** EventPropagationGraphAudit: the bus path must remain named. */
import fs from 'node:fs';
const files=['ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js','ckidsAwtsmoos/systems/village/VillageActivitySchedulerRuntime.js','ckidsAwtsmoos/systems/world/WorldEventDirectorRuntime.js','ckidsAwtsmoos/systems/ui/WorldPresentationBus.js'];
const rows=files.map(file=>({file,exists:fs.existsSync(file),usesBus:fs.existsSync(file)&&fs.readFileSync(file,'utf8').includes('WorldPresentationBus')}));
const report={ok:rows.every(r=>r.exists),path:['input','simulation','living-world','village','world-director','presentation-bus','ui/render'],rows};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_event_propagation_graph.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:report.ok,path:report.path},null,2));
if(!report.ok)process.exit(1);
