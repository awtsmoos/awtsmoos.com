// B"H
/** Scheduler/loop audit: classifies timers and RAF usage. */
import fs from 'node:fs';
import path from 'node:path';
const roots = ['index.js','systems','ckidsAwtsmoos'];
const files = [];
function walk(p) { if (!fs.existsSync(p)) return; const st = fs.statSync(p); if (st.isDirectory()) { for (const n of fs.readdirSync(p)) if (n !== 'node_modules' && n !== 'AI_THOUGHTS') walk(path.join(p,n)); } else if (/\.(js|mjs|html)$/.test(p)) files.push(p.replaceAll('\\','/')); }
roots.forEach(walk);
const patterns = { requestAnimationFrame:/requestAnimationFrame/g, setInterval:/setInterval/g, setTimeout:/setTimeout/g, requestIdleCallback:/requestIdleCallback/g, localStorageSet:/localStorage\s*\.\s*setItem|setItem\?\.\(/g, saveLivingWorld:/saveLivingWorldState/g };
const rows = [];
for (const file of files) { const text = fs.readFileSync(file,'utf8'); const counts = {}; let total=0; for (const [k,re] of Object.entries(patterns)) { counts[k] = (text.match(re)||[]).length; total += counts[k]; } if (total) rows.push({ file, ...counts, total }); }
const risky = rows.filter(r => r.setInterval || r.requestAnimationFrame > 1 || r.saveLivingWorld > 2 || r.localStorageSet > 1);
const summary = { ok:true, filesScanned:files.length, filesWithSchedulers:rows.length, risky:risky.length, totals:Object.fromEntries(Object.keys(patterns).map(k => [k, rows.reduce((a,r)=>a+(r[k]||0),0)])) };
const result = { summary, risky:risky.slice(0,200), rows:rows.slice(0,300) };
fs.mkdirSync('AI_THOUGHTS/performance_reports', { recursive:true });
fs.writeFileSync('AI_THOUGHTS/performance_reports/latest_scheduler_loop_audit.json', JSON.stringify(result,null,2));
console.log(JSON.stringify(result, null, 2));
