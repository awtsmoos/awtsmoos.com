// B"H
import fs from 'node:fs';
import path from 'node:path';
const roots = ['geelooy/style/social/home/index.css','geelooy/style/heichelos/heichel/index.css','geelooy/heichelos/post/styles/main.css','geelooy/style/awtsmoos-scroll-sovereignty.css'];
const seen = new Set();
function resolveImport(base, spec) {
  if (spec.startsWith('/')) return path.join('geelooy', spec.replace(/^\//, ''));
  return path.normalize(path.join(path.dirname(base), spec));
}
function walk(file) {
  if (seen.has(file)) return; seen.add(file);
  if (!fs.existsSync(file)) throw new Error(`missing css file ${file}`);
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) walk(resolveImport(file, match[1]));
}
roots.forEach(walk);
console.log('B"H cssImportGraph.test passed', seen.size);
