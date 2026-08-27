// B"H
import { mergeMeshes } from '../transform.js';
import { bar } from './helpers.js';

/** B"H: The glyph leans forward like a spark trying to become speech. */
export function letterMesh() {
  return mergeMeshes([
    bar([0, 0, 0], [0.22, 1.55, 0.18]),
    bar([-0.34, 0.34, 0], [0.72, 0.17, 0.18]),
    bar([0.3, -0.28, 0], [0.66, 0.17, 0.18]),
    bar([0, 0.02, 0], [0.15, 1.42, 0.15], -0.36)
  ]);
}
