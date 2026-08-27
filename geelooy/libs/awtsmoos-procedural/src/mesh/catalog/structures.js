// B"H
import { ringMesh } from '../primitives.js';
import { mergeMeshes, transformMesh } from '../transform.js';
import { bar } from './helpers.js';

/** B"H: An arch must frame the road, not devour the camera. */
export function archMesh() {
  return mergeMeshes([
    bar([-0.58, -0.28, 0], [0.2, 1.18, 0.24]),
    bar([0.58, -0.28, 0], [0.2, 1.18, 0.24]),
    transformMesh(ringMesh({ plane: 'xy', outer: 0.72, inner: 0.52, segments: 36 }), { translate: [0, 0.3, 0] }),
    bar([0, 0.28, 0], [1.08, 0.16, 0.22])
  ]);
}

/** B"H: A gate hints at a higher world while keeping the path visible. */
export function gateMesh() {
  return mergeMeshes([
    transformMesh(ringMesh({ plane: 'xy', outer: 0.76, inner: 0.61, segments: 42 }), { scale: [0.9, 1.05, 1], translate: [0, 0.05, 0] }),
    bar([-0.68, -0.22, 0], [0.14, 1.18, 0.2]),
    bar([0.68, -0.22, 0], [0.14, 1.18, 0.2]),
    bar([0, -0.82, 0], [1.42, 0.1, 0.22])
  ]);
}
