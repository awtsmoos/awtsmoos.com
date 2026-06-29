// B"H
/**
 * Feature connectivity audit.
 * Reads real project files and reports which Runtime/Registry/Bootstrap files
 * are reachable from the browser/worker boot graph scanned by ImportContractScanner.
 * This is a report, not a failing gate: many systems may be libraries, prototypes,
 * or intentionally lazy-loaded. The point is to expose uncertainty.
 */
import fs from 'node:fs';
import path from 'node:path';
import { scanImportContracts } from './ImportContractScanner.mjs';
const root = process.cwd();
const dirs = ['ckidsAwtsmoos/systems', 'systems', 'ckidsAwtsmoos/Olam/worlds/mitzvahWorld'];
function walk(dir, out = []) { if (!fs.existsSync(dir)) return out; for (const n of fs.readdirSync(dir)) { const p = path.join(dir, n); const st = fs.statSync(p); if (st.isDirectory() && n !== 'node_modules' && n !== 'AI_THOUGHTS') walk(p, out); else if (st.isFile() && /(?:Runtime|Registry|Bootstrap)\.m?js$/.test(n)) out.push(p.replaceAll('\\', '/')); } return out; }
function read(p) { return fs.readFileSync(p, 'utf8'); }
function stat(file) { const s = read(file); return { lines:s.split(/\r?\n/).length, imports:(s.match(/^\s*import\s/gm)||[]).length, exports:(s.match(/^\s*export\s/gm)||[]).length, todos:(s.match(/TODO|STUB|prototype|not implemented|throw new Error/gi)||[]).length, hasDefault:/^\s*export\s+default\b/m.test(s) }; }
const scan = scanImportContracts({ maxModules:1600 });
const reachable = new Set((scan.sample || []).map(x => x.file));
// scan.sample is short, so recover reachable from full JSON is not exported. Build approximation from scanner output is insufficient.
// Therefore also grep browser-critical references directly.
const allTextFiles = [];
function allJs(dir){ if(!fs.existsSync(dir)) return; for(const n of fs.readdirSync(dir)){ const p=path.join(dir,n); const st=fs.statSync(p); if(st.isDirectory() && n !== 'node_modules' && n !== 'AI_THOUGHTS') allJs(p); else if(st.isFile() && /\.(js|mjs|html)$/.test(n)) allTextFiles.push(p.replaceAll('\\','/')); } }
['index.html','index.js','systems','ckidsAwtsmoos'].forEach(p => fs.existsSync(p) && (fs.statSync(p).isDirectory() ? allJs(p) : allTextFiles.push(p)));
const textBlob = allTextFiles.slice(0, 5000).map(f => { try { return read(f); } catch { return ''; } }).join('\n');
const features = dirs.flatMap(d => walk(d)).sort();
const rows = features.map(file => { const rel = file.replace(/^\.\//,''); const base = path.basename(rel); const mentioned = textBlob.includes(rel) || textBlob.includes('./' + rel) || textBlob.includes('../' + rel) || textBlob.includes(base); return { file:rel, mentioned, ...stat(rel) }; });
const summary = { at:new Date().toISOString(), total:rows.length, mentioned:rows.filter(r=>r.mentioned).length, notMentioned:rows.filter(r=>!r.mentioned).length, possibleStubs:rows.filter(r=>r.todos>0).length, zeroImportRows:rows.filter(r=>r.imports===0).length, importContractOk:scan.ok };
const report = { summary, notMentioned:rows.filter(r=>!r.mentioned).slice(0,200), possibleStubs:rows.filter(r=>r.todos>0).slice(0,200), zeroImportRows:rows.filter(r=>r.imports===0).slice(0,200) };
console.log(JSON.stringify(report, null, 2));
fs.mkdirSync('AI_THOUGHTS/feature_connectivity_reports', { recursive:true });
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_connectivity_audit.json', JSON.stringify(report, null, 2));
