// B"H
import fs from 'node:fs';
const frameFiles=['ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js','ckidsAwtsmoos/systems/village/VillageActivitySchedulerRuntime.js'];
const rows=frameFiles.map(file=>{const s=fs.readFileSync(file,'utf8'); return {file, arraySpreads:(s.match(/\.\.\./g)||[]).length, objectLiterals:(s.match(/\{[^\n{}]*:[^\n{}]*\}/g)||[]).length, jsonStringify:(s.match(/JSON\.stringify/g)||[]).length};});
const report={ok:rows.every(r=>r.jsonStringify===0), rows, note:'Budgeted frame path avoids persistence/stringify; object allocation remains monitored.'};
fs.mkdirSync('AI_THOUGHTS/hardening_reports',{recursive:true}); fs.writeFileSync('AI_THOUGHTS/hardening_reports/latest_allocation_audit.json',JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2)); if(!report.ok) process.exit(1);
