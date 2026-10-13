// B"H — Bake procedural tree geometries to static JSON assets (one-time).
// The 4 archetypes are fully deterministic (no per-render seed), so baking
// removes ~1.5-9s of tree-gen JS from every render, forever.
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateTreeProceduralData } from '../../../../../libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'assets', 'trees');
await mkdir(OUT, { recursive: true });

const ARCHETYPES = ['Oak Large', 'Pine Large', 'Birch Elegant', 'Willow Weeping'];

function packStream(stream) {
  const out = {};
  for (const k of ['positions', 'normals', 'uvs', 'colors']) {
    if (stream[k]?.length) out[k] = Array.from(stream[k], v => +v.toFixed(3));
  }
  if (stream.indices?.length) out.indices = Array.from(stream.indices);
  return out;
}

for (const name of ARCHETYPES) {
  const t0 = Date.now();
  const t = generateTreeProceduralData(name, { detail: 'balanced' });
  const baked = {
    name,
    detail: 'balanced',
    bark: packStream(t.branches),
    leaves: packStream(t.leaves),
  };
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const file = path.join(OUT, `${slug}.json`);
  await writeFile(file, JSON.stringify(baked));
  const kb = (await import('node:fs/promises')).statSync
    ? null : null;
  const { size } = await import('node:fs').then(fs => fs.promises.stat(file));
  console.log(`${name}: ${(size / 1024).toFixed(0)}KB in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
console.log('done ->', OUT);
