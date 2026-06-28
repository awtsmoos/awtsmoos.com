// B"H
/** Boot/runtime integrity: startup scripts, duplicate registrations, and ownership evidence. */
import fs from 'node:fs';
import path from 'node:path';
function walk(dir, out=[]){ if(!fs.existsSync(dir)) return out; for(const n of fs.readdirSync(dir)){ const p=path.join(dir,n); const st=fs.statSync(p); if(st.isDirectory() && n!=='node_modules' && n!=='AI_THOUGHTS') walk(p,out); else if(st.isFile() && /\.(js|mjs|html)$/.test(n)) out.push(p.replaceAll('\\','/')); } return out; }
const files = ['index.html', ...walk('systems'), ...walk('ckidsAwtsmoos')];
const scriptRows = [];
const html = fs.readFileSync('index.html','utf8');
const scriptRe = /<script\b[^>]*type=["']module["'][^>]*src=["']([^"']+)["'][^>]*>/g;
let m; while((m=scriptRe.exec(html))) scriptRows.push(m[1]);
const counts = { addEventListener:0, requestAnimationFrame:0, setInterval:0, setTimeout:0, customEvent:0 };
const duplicateListeners = [];
for(const file of files){ const text=fs.readFileSync(file,'utf8'); for(const k of Object.keys(counts)) counts[k] += (text.match(new RegExp(k,'g'))||[]).length; const evs=[...text.matchAll(/addEventListener\?*\.\s*\(\s*['"]([^'"]+)['"]/g)].map(x=>x[1]); const seen={}; for(const e of evs){ seen[e]=(seen[e]||0)+1; if(seen[e]>2) duplicateListeners.push({file,event:e,count:seen[e]}); } }
const owners = ['__MITZVAH_WORLD_LIVING_WORLD__','__MITZVAH_BROWSER_FRAME_TRACE__','__AWTSMOOS_MOBILE_CLEAN_HUD__','__MITZVAH_STARTER_EXPERIENCE__'];
const ownerEvidence = Object.fromEntries(owners.map(o=>[o, files.some(f=>fs.readFileSync(f,'utf8').includes(o))]));
const report = { ok:scriptRows.length>0 && Object.values(ownerEvidence).every(Boolean), moduleScripts:scriptRows, counts, duplicateListeners:duplicateListeners.slice(0,50), ownerEvidence };
fs.mkdirSync('AI_THOUGHTS/hardening_reports',{recursive:true});
fs.writeFileSync('AI_THOUGHTS/hardening_reports/latest_boot_runtime_integrity.json', JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:report.ok,moduleScripts:scriptRows.length,counts,ownerEvidence,duplicateListenerRows:duplicateListeners.length},null,2));
if(!report.ok) process.exit(1);
