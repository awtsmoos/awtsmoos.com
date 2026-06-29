// B"H
import {
  catalogMesh,
  catalogNames,
  cityChunkMeshes,
  inspectMesh,
  makeGoldenProbe,
  mergeMeshes,
  meshToTriangles,
  triangleStats,
  validateMesh
} from '../src/index.js';

const probe = makeGoldenProbe();
const probeCheck = inspectMesh(probe);
if (!probeCheck.validation.ok) fail('probe', probeCheck.validation.issues);

const chunk = mergeMeshes(cityChunkMeshes({ seed: 'smoke', count: 25 }));
const chunkCheck = validateMesh(chunk, { maxAbs: 1000 });
if (!chunkCheck.ok) fail('chunk', chunkCheck.issues);

const catalog = [];
for (const name of catalogNames()) {
  const mesh = catalogMesh(name);
  const check = validateMesh(mesh, { maxAbs: 1000 });
  if (!check.ok) fail(name, check.issues);
  const stats = triangleStats(meshToTriangles(mesh));
  if (!stats.finite || stats.triangles < 1) fail(name, ['triangle conversion failed']);
  catalog.push([name, stats.triangles]);
}

console.log(JSON.stringify({
  ok: true,
  probe: probeCheck.summary,
  chunkVertices: chunk.positions.length / 3,
  catalog
}));

function fail(label, issues) {
  throw new Error(label + ': ' + issues.join('; '));
}
