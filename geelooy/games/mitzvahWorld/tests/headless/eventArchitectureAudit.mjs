// B"H
import fs from 'node:fs';
const bus = fs.readFileSync('ckidsAwtsmoos/systems/ui/WorldPresentationBus.js','utf8');
const migrated = ['ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js','ckidsAwtsmoos/systems/village/VillageActivitySchedulerRuntime.js','ckidsAwtsmoos/systems/world/WorldEventDirectorRuntime.js'].map(f=>({file:f,usesBus:fs.readFileSync(f,'utf8').includes('WorldPresentationBus.js')}));
const report={ok:bus.includes('publishLivingWorld') && migrated.every(x=>x.usesBus), migrated};
fs.mkdirSync('AI_THOUGHTS/hardening_reports',{recursive:true});
fs.writeFileSync('AI_THOUGHTS/hardening_reports/latest_event_architecture.json', JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2)); if(!report.ok) process.exit(1);
