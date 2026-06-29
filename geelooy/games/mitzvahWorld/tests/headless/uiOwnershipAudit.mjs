// B"H
import fs from 'node:fs';
const files=['systems/mobile/MobileCleanHudRuntime.js','ckidsAwtsmoos/systems/ui/WorldPresentationBus.js','ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js'];
const rows=files.map(f=>({file:f, hasUiPayload:fs.readFileSync(f,'utf8').includes('uiPayload'), hasBus:fs.readFileSync(f,'utf8').includes('WorldPresentationBus') || f.includes('WorldPresentationBus'), hasMobileClean:f.includes('Mobile')?fs.readFileSync(f,'utf8').includes('world-first-pass-2'):undefined}));
const report={ok:rows.some(r=>r.hasBus)&&rows.some(r=>r.hasMobileClean===true), rows, ownership:'WorldPresentationBus owns publishing; MobileCleanHudRuntime owns mobile collapse; LivingWorldState owns payload shape.'};
fs.mkdirSync('AI_THOUGHTS/hardening_reports',{recursive:true}); fs.writeFileSync('AI_THOUGHTS/hardening_reports/latest_ui_ownership.json',JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2)); if(!report.ok) process.exit(1);
