// B"H
/** Audit that the infinite realism fast runtime spine is wired, importable, and not fantasy. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const files = [
  'systems/performance/RenderBudgetApplier.js',
  'systems/performance/MaterialTextureGovernor.js',
  'systems/performance/FastRealismRuntimeOverlay.js',
  'systems/realism/SpatialInterestRegistry.js',
  'systems/realism/InfiniteRealismRuntime.js',
  'systems/realism/InfiniteRealismBootstrap.js'
];
const requiredIndexSnippets = ['RuntimeBudgetBootstrap.js', 'RealismFastFpsBootstrap.js', 'InfiniteRealismBootstrap.js'];
const requiredPackageSnippet = 'test:infinite-realism-fast';
function assert(ok, msg) { if (!ok) throw new Error(msg); }
for (const file of files) {
  const mod = await import(path.join(root, file));
  assert(Object.keys(mod).length > 0, `No exports from ${file}`);
}
const index = await readFile(path.join(root, 'index.html'), 'utf8');
for (const snippet of requiredIndexSnippets) assert(index.includes(snippet), `Missing boot script ${snippet}`);
const pkg = await readFile(path.join(root, 'package.json'), 'utf8');
assert(pkg.includes(requiredPackageSnippet), `Missing ${requiredPackageSnippet}`);
console.log(JSON.stringify({ ok:true, audited:files.length, bootScripts:requiredIndexSnippets.length }, null, 2));
