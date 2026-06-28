// B"H
/** TemporalDependencyAudit: boot order is a ladder, not fog. */
import fs from 'node:fs';
const order=['index.html','index.js','systems/boot/DeferredBootScheduler.js','systems/performance/RuntimeBudgetBootstrap.js','ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js','ckidsAwtsmoos/systems/village/VillageActivitySchedulerRuntime.js','ckidsAwtsmoos/systems/world/WorldEventDirectorRuntime.js','ckidsAwtsmoos/systems/ui/WorldPresentationBus.js','systems/mobile/MobileCleanHudRuntime.js'];
const rows=order.map((file,index)=>({index,file,exists:fs.existsSync(file)}));
const report={ok:rows.every(r=>r.exists||r.file==='systems/boot/DeferredBootScheduler.js'),order:rows,note:'Static intended order; not real browser timing proof.'};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_temporal_dependency_audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:report.ok,steps:rows.length,missing:rows.filter(r=>!r.exists).map(r=>r.file)},null,2));
if(!report.ok)process.exit(1);
