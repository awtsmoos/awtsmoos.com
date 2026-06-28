// B"H
import fs from 'node:fs';
const required = {
  living:'ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js',
  policy:'ckidsAwtsmoos/systems/core/SimulationPulsePolicy.js',
  village:'ckidsAwtsmoos/systems/village/VillageActivitySchedulerRuntime.js',
  director:'ckidsAwtsmoos/systems/world/WorldEventDirectorRuntime.js'
};
const text = Object.fromEntries(Object.entries(required).map(([k,f])=>[k,fs.readFileSync(f,'utf8')]));
const report = { ok:text.living.includes('frame(') && text.living.includes('flush(') && text.living.includes('pulsePolicy') && text.village.includes('hasLoop:false') && text.director.includes('hasLoop:false'), ownership:{ livingOwner:'__MITZVAH_WORLD_LIVING_WORLD__', framePath:'LivingWorldRuntime.frame', fullPath:'LivingWorldRuntime.step', persistencePath:'LivingWorldRuntime.flush/saveBoth' } };
fs.mkdirSync('AI_THOUGHTS/hardening_reports',{recursive:true});
fs.writeFileSync('AI_THOUGHTS/hardening_reports/latest_simulation_ownership.json', JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!report.ok) process.exit(1);
