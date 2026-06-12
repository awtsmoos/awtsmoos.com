// B"H
import fs from 'node:fs';
import path from 'node:path';
const roots = ['geelooy/style/foundation/legend/index.css','geelooy/style/social/home/legend/index.css','geelooy/style/heichelos/heichel/legend/index.css','geelooy/heichelos/post/styles/reader-legend/index.css'];
const seen = new Set();
function resolveImport(base, spec) { return spec.startsWith('/') ? path.join('geelooy', spec.replace(/^\//, '')) : path.normalize(path.join(path.dirname(base), spec)); }
function walk(file) { if (seen.has(file)) return; seen.add(file); if (!fs.existsSync(file)) throw new Error('missing legend import '+file); const text=fs.readFileSync(file,'utf8'); for (const match of text.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) walk(resolveImport(file, match[1])); }
roots.forEach(walk);
console.log('B"H legendImportGraph.test passed', seen.size);
