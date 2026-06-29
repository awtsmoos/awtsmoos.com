// B"H
import { cylinderMesh, sphereMesh } from '../primitives.js';
import { mergeMeshes, transformMesh } from '../transform.js';

/** B"H: The tree grows upward but remembers the traveler needs a horizon. */
export function treeMesh() {
  return mergeMeshes([
    transformMesh(cylinderMesh({ radius: 0.14, height: 1.0, segments: 14 }), { translate: [0, -0.28, 0] }),
    transformMesh(sphereMesh({ radius: 0.48, rings: 6, segments: 12 }), { scale: [1, 0.72, 1], translate: [0, 0.45, 0] }),
    transformMesh(sphereMesh({ radius: 0.29, rings: 5, segments: 10 }), { translate: [0.25, 0.6, 0.03] })
  ]);
}

/** B"H: The cloud is now a soft marker, not a wall across the sky. */
export function cloudMesh() {
  return mergeMeshes([
    puff(-0.3, 0, 0, 0.34),
    puff(0.1, 0.05, 0, 0.44),
    puff(0.48, -0.02, 0.02, 0.3),
    puff(0.08, -0.12, 0.24, 0.28)
  ]);
}

function puff(x, y, z, radius) {
  return transformMesh(sphereMesh({ radius, rings: 5, segments: 10 }), { translate: [x, y, z] });
}
