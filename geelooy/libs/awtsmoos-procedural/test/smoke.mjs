import {
  cityChunkMeshes,
  inspectMesh,
  makeGoldenProbe,
  mergeMeshes,
  validateMesh
} from '../src/index.js';

const probe = makeGoldenProbe();
const probeCheck = inspectMesh(probe);
if (!probeCheck.validation.ok) throw new Error(probeCheck.validation.issues.join('\n'));

const chunk = mergeMeshes(cityChunkMeshes({ seed: 'smoke', count: 25 }));
const check = validateMesh(chunk, { maxAbs: 1000 });
if (!check.ok) throw new Error(check.issues.join('\n'));

console.log(JSON.stringify({ ok: true, probe: probeCheck.summary, chunkVertices: chunk.positions.length / 3 }));
