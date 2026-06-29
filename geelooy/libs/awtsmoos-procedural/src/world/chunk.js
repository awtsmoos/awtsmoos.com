import { createRng, range } from '../math/rng.js';
import { buildingMesh } from './building.js';

/**
 * B"H
 * @chapter The chunk learned spacing so buildings would not crush the camera.
 */
export function cityChunkMeshes({ seed = 'chunk', count = 12, size = 96, maxHeight = 48 } = {}) {
  const rng = createRng(seed);
  return Array.from({ length: count }, (_, n) => buildingMesh({
    x: range(rng, -size / 2, size / 2),
    z: range(rng, -size / 2, size / 2),
    width: range(rng, 3, 11),
    depth: range(rng, 3, 11),
    height: range(rng, 5, maxHeight),
    maxHeight,
    color: [0.25 + rng() * 0.45, 0.12 + rng() * 0.25, 0.65 + rng() * 0.3, 1]
  }));
}

export function mergeMeshes(meshes) {
  const out = { positions: [], indices: [], colors: [] };
  for (const mesh of meshes) {
    const offset = out.positions.length / 3;
    out.positions.push(...(mesh.positions || []));
    out.indices.push(...(mesh.indices || []).map(i => i + offset));
    if (mesh.colors) out.colors.push(...mesh.colors);
  }
  return out;
}
