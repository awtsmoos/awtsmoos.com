// B"H
import { cubeMesh, cylinderMesh, discMesh, planeMesh, ringMesh, sphereMesh, starMesh } from '../primitives.js';
import { transformMesh } from '../transform.js';
import { letterMesh } from './glyphs.js';
import { cloudMesh, treeMesh } from './nature.js';
import { archMesh, gateMesh } from './structures.js';

/** B"H: The registry names each vessel, then gets out of the way. */
const BUILDERS = {
  cube: () => cubeMesh(),
  box: () => cubeMesh(),
  plane: () => planeMesh(),
  disc: () => discMesh({ segments: 40 }),
  sphere: () => sphereMesh({ rings: 8, segments: 14 }),
  cylinder: () => cylinderMesh({ segments: 24 }),
  ring: () => ringMesh({ plane: 'xz', segments: 42 }),
  star: () => starMesh({ points: 6 }),
  shard: () => transformMesh(starMesh({ points: 4, height: 0.9 }), { scale: [0.45, 1.05, 0.45] }),
  letter: letterMesh,
  arch: archMesh,
  gate: gateMesh,
  tree: treeMesh,
  cloud: cloudMesh
};

export function catalogNames() {
  return Object.keys(BUILDERS);
}

export function catalogMesh(name = 'cube') {
  return (BUILDERS[name] || BUILDERS.cube)();
}
