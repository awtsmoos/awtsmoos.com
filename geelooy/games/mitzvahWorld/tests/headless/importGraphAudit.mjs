// B"H
/**
 * ImportGraphAudit
 *
 * A graph of breath: every static import becomes an edge, every script a root,
 * every unreachable island a named shore. The full edge list is written to a
 * report; stdout stays small so the tunnel remains a clear vessel.
 *
 * Chapter of the living code: before the report descends into letters, the
 * vessel itself is made. The Awtsmoos does not ask a directory to exist by
 * assumption; He creates the space, and then the graph can speak.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '.';
const REPORT_DIR = 'AI_THOUGHTS/architecture_reports';
const REPORT_PATH = `${REPORT_DIR}/latest_import_graph.json`;
const SOURCE_RE = /\.(js|mjs|html)$/i;
const SKIP = new Set(['node_modules', '.git', 'AI_THOUGHTS']);

function n(v = '') {
  return String(v).replaceAll('\\\\', '/').replace(/^\.\//, '');
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const file = path.join(dir, name);
    const st = fs.statSync(file);
    if (st.isDirectory()) walk(file, out);
    else if (st.isFile() && SOURCE_RE.test(file)) out.push(n(file));
  }
  return out;
}

function read(f) {
  try { return fs.readFileSync(f, 'utf8'); }
  catch { return ''; }
}

function specs(text) {
  const out = [];
  const patterns = [
    /import\s+(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /export\s+[^'";]+\s+from\s+['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /<script[^>]+src=["']([^"']+)["']/g
  ];
  for (const re of patterns) for (const m of text.matchAll(re)) out.push(m[1]);
  return out;
}

function resolve(from, s) {
  if (!s || s.startsWith('http') || s.startsWith('@')) return null;
  if (s.startsWith('/games/mitzvahWorld/')) return n(s.replace('/games/mitzvahWorld/', ''));
  if (!s.startsWith('.')) return n(s);
  const base = path.posix.dirname(n(from));
  const raw = n(path.posix.normalize(path.posix.join(base, s.split('?')[0])));
  const tries = [raw, `${raw}.js`, `${raw}.mjs`, `${raw}/index.js`];
  return tries.find(t => fs.existsSync(t)) || raw;
}

function domain(file) {
  if (file === 'index.html' || file === 'index.js' || file.startsWith('systems/boot/')) return 'boot';
  if (file.startsWith('tests/')) return 'testing';
  if (file.includes('/postbuild/')) return 'postbuild';
  if (file.startsWith('systems/universe/')) return 'alternate-universe';
  if (file.startsWith('systems/ui/') || file.startsWith('systems/mobile/') || file.includes('/systems/ui/')) return 'ui';
  if (file.startsWith('systems/performance/')) return 'performance';
  if (file.includes('/livingWorld/')) return 'living-world';
  if (file.includes('/village/')) return 'village';
  if (file.includes('/world/')) return 'world';
  if (file.includes('/feature49/') || file.includes('/feature100/')) return 'prototype';
  return 'other';
}

fs.mkdirSync(REPORT_DIR, { recursive: true });
const files = walk(ROOT);
const fileSet = new Set(files);
const edges = [];
for (const file of files) {
  for (const s of specs(read(file))) {
    const to = resolve(file, s);
    if (to) edges.push({ from:file, to, spec:s, internal:fileSet.has(to), fromDomain:domain(file), toDomain:domain(to) });
  }
}

const roots = files.filter(f => f === 'index.html' || f === 'index.js' || f.startsWith('tests/') || f.includes('/postbuild/'));
const outByFrom = new Map();
for (const e of edges.filter(e => e.internal)) {
  if (!outByFrom.has(e.from)) outByFrom.set(e.from, []);
  outByFrom.get(e.from).push(e.to);
}
const seen = new Set();
const stack = [...roots];
while (stack.length) {
  const f = stack.pop();
  if (seen.has(f)) continue;
  seen.add(f);
  for (const to of outByFrom.get(f) || []) stack.push(to);
}
const unreachable = files.filter(f => !seen.has(f) && !f.startsWith('tests/'));
const byDomain = files.reduce((a, f) => { a[domain(f)] = (a[domain(f)] || 0) + 1; return a; }, {});
const report = { ok:true, fileCount:files.length, edgeCount:edges.length, internalEdgeCount:edges.filter(e => e.internal).length, rootCount:roots.length, reachableCount:seen.size, unreachable:unreachable.slice(0, 500), unreachableCount:unreachable.length, byDomain, edges };
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok:true, fileCount:report.fileCount, edgeCount:report.edgeCount, internalEdgeCount:report.internalEdgeCount, rootCount:report.rootCount, reachableCount:report.reachableCount, unreachableCount:report.unreachableCount, byDomain }, null, 2));
