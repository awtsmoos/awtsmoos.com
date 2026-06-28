// B"H
/**
 * ImportContractScanner
 * Node-DOM import contract guard: catches missing files and missing exports that
 * browsers report as vague dynamic import failures, without executing WebGL.
 */
import fs from 'node:fs';
import path from 'node:path';
const JS_EXT = /\.(mjs|js|cjs)$/;
const repoRoot = process.cwd();
const externalPrefixes = ['http:', 'https:', 'data:', 'blob:', 'node:', 'three/', '/libs/', '/games/scripts/'];
function stripQuery(spec = '') { return String(spec).split('?')[0].split('#')[0]; }
function existsFile(p) { try { return fs.statSync(p).isFile(); } catch { return false; } }
function read(p) { return fs.readFileSync(p, 'utf8'); }
function rel(p) { return path.relative(repoRoot, p).replaceAll('\\', '/'); }
function isExternal(spec = '') { return externalPrefixes.some(prefix => spec.startsWith(prefix)); }
function cleanSpec(spec = '') { return stripQuery(String(spec).trim()); }
function resolveAbsolute(spec) {
  const no = cleanSpec(spec);
  const candidates = [];
  if (no.startsWith('/games/mitzvahWorld/')) candidates.push(path.join(repoRoot, no.replace('/games/mitzvahWorld/', '')));
  if (no.startsWith('/geelooy/games/mitzvahWorld/')) candidates.push(path.join(repoRoot, no.replace('/geelooy/games/mitzvahWorld/', '')));
  if (no.startsWith('/')) candidates.push(path.join(repoRoot, no.slice(1)));
  return candidates.find(existsFile) || candidates[0] || null;
}
export function resolveImport(spec, fromFile = null) {
  const raw = String(spec || '');
  if (!raw || isExternal(raw)) return { kind:'external', raw };
  const no = cleanSpec(raw);
  if (!no.startsWith('.') && !no.startsWith('/')) return { kind:'external', raw };
  let abs = no.startsWith('/') ? resolveAbsolute(no) : path.resolve(path.dirname(fromFile || path.join(repoRoot, 'index.html')), no);
  if (abs && !path.extname(abs) && existsFile(`${abs}.js`)) abs = `${abs}.js`;
  if (abs && fs.existsSync(abs) && fs.statSync(abs).isDirectory() && existsFile(path.join(abs, 'index.js'))) abs = path.join(abs, 'index.js');
  return { kind:'file', raw, path:abs, exists:Boolean(abs && existsFile(abs)) };
}
function parseNamedList(body = '') { return body.split(',').map(x => x.trim()).filter(Boolean).map(x => x.split(/\s+as\s+/)[0].trim()).filter(x => x && x !== 'type'); }
function parseImportClause(clause = '') {
  const wants = { default:false, named:[], namespace:false };
  const c = clause.trim();
  if (!c) return wants;
  if (c.startsWith('*')) { wants.namespace = true; return wants; }
  const named = c.match(/\{([\s\S]*?)\}/);
  if (named) wants.named.push(...parseNamedList(named[1]));
  const before = c.replace(/\{[\s\S]*?\}/, '').split(',').map(x => x.trim()).filter(Boolean);
  if (before.length && !before[0].startsWith('*')) wants.default = true;
  return wants;
}
export function parseImports(source = '') {
  const rows = [];
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const staticRe = /^\s*import\s+(?!\()([^\n;]*?)\s+from\s*["']([^"']+)["'];?/gm;
  const sideRe = /^\s*import\s*["']([^"']+)["'];?/gm;
  const dynamicRe = /(?:^|[=(:,\s])import\s*\(\s*["']([^"']+)["']\s*\)/gm;
  const exportFromRe = /^\s*export\s+(?:\*|\{[^\n;]*?\})\s+from\s*["']([^"']+)["'];?/gm;
  let m;
  while ((m = staticRe.exec(text))) rows.push({ spec:m[2], wants:parseImportClause(m[1]), kind:'static' });
  while ((m = sideRe.exec(text))) rows.push({ spec:m[1], wants:{ default:false, named:[], namespace:false }, kind:'side-effect' });
  while ((m = dynamicRe.exec(text))) rows.push({ spec:m[1], wants:{ default:false, named:[], namespace:true }, kind:'dynamic' });
  while ((m = exportFromRe.exec(text))) rows.push({ spec:m[1], wants:{ default:false, named:[], namespace:true }, kind:'export-from' });
  return rows;
}
export function parseExports(source = '') {
  const named = new Set();
  let hasDefault = /(^|\n)\s*export\s+default\b/.test(source);
  for (const re of [/^\s*export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm, /^\s*export\s+class\s+([A-Za-z_$][\w$]*)/gm, /^\s*export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/gm]) { let m; while ((m = re.exec(source))) named.add(m[1]); }
  const blockRe = /^\s*export\s*\{([\s\S]*?)\}/gm;
  let b;
  while ((b = blockRe.exec(source))) for (const n of parseNamedList(b[1]).map(x => x.includes('default') ? 'default' : x)) n === 'default' ? hasDefault = true : named.add(n);
  return { default:hasDefault, named:[...named].sort() };
}
function indexModuleScripts() {
  const file = path.join(repoRoot, 'index.html');
  if (!existsFile(file)) return [];
  const html = read(file), rows = [];
  const re = /<script\b[^>]*type=["']module["'][^>]*src=["']([^"']+)["'][^>]*>/g;
  let m; while ((m = re.exec(html))) rows.push({ spec:m[1], from:file, label:'index.html module' });
  return rows;
}
function workerLedgerScripts() {
  const file = path.join(repoRoot, 'ckidsAwtsmoos/Olam/oyved/core/boot/ModulePathLedger.js');
  if (!existsFile(file)) return [];
  const rows = [], re = /relativePath:\s*["']([^"']+)["']/g, source = read(file);
  let m; while ((m = re.exec(source))) rows.push({ spec:m[1], from:file, label:'worker ledger' });
  return rows;
}
function seeds(extra = []) { return [...indexModuleScripts(), ...workerLedgerScripts(), ...extra]; }
export function scanImportContracts(options = {}) {
  const queue = seeds(options.extraSeeds || []), seen = new Set(), modules = [], issues = [];
  const maxModules = options.maxModules || 1400;
  while (queue.length && modules.length < maxModules) {
    const item = queue.shift();
    const resolved = resolveImport(item.spec, item.from);
    if (resolved.kind === 'external') continue;
    if (!resolved.exists) { issues.push({ type:'missing-file', spec:item.spec, from:item.from ? rel(item.from) : null, expected:resolved.path ? rel(resolved.path) : null, label:item.label || null }); continue; }
    const file = resolved.path;
    if (seen.has(file) || !JS_EXT.test(file)) continue;
    seen.add(file);
    const source = read(file), exports = parseExports(source), imports = parseImports(source);
    modules.push({ file:rel(file), imports:imports.length, exports });
    for (const row of imports) {
      const child = resolveImport(row.spec, file);
      if (child.kind === 'external') continue;
      if (!child.exists) { issues.push({ type:'missing-file', spec:row.spec, from:rel(file), expected:child.path ? rel(child.path) : null, kind:row.kind }); continue; }
      if (!JS_EXT.test(child.path)) continue;
      const childExports = parseExports(read(child.path));
      if (row.wants.default && !childExports.default) issues.push({ type:'missing-default-export', spec:row.spec, from:rel(file), target:rel(child.path) });
      for (const name of row.wants.named || []) if (!childExports.named.includes(name)) issues.push({ type:'missing-named-export', name, spec:row.spec, from:rel(file), target:rel(child.path), available:childExports.named.slice(0,30) });
      queue.push({ spec:row.spec, from:file, label:row.kind });
    }
  }
  if (queue.length) issues.push({ type:'scan-truncated', remaining:queue.length, maxModules });
  return { ok:issues.length === 0, modules:modules.length, issues, sample:modules.slice(0,20) };
}
export default scanImportContracts;
