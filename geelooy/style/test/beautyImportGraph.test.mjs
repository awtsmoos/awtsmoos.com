// B"H
import fs from 'node:fs';
import path from 'node:path';
const roots = ['geelooy/style/foundation/beauty/index.css','geelooy/style/social/home/beauty/index.css','geelooy/style/heichelos/heichel/beauty/index.css','geelooy/heichelos/post/styles/reader-beauty/index.css'];
const seen = new Set();
function resolveImport(base, spec) { return spec.startsWith('/') ? path.join('geelooy', spec.replace(/^\//, '')) : path.normalize(path.join(path.dirname(base), spec)); }
function walk(file) { if (seen.has(file)) return; seen.add(file); if (!fs.existsSync(file)) throw new Error('missing beauty import '+file); const text=fs.readFileSync(file,'utf8'); for (const m of text.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) walk(resolveImport(file,m[1])); }
roots.forEach(walk);
console.log('B"H beautyImportGraph.test passed', seen.size);
