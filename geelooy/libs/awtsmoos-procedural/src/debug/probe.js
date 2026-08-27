import { cubeMesh } from '../mesh/primitives.js';
import { validateMesh } from '../mesh/validate.js';
import { summarizeMesh } from '../mesh/summary.js';

/**
 * B"H
 * @chapter One golden cube is the witness: if it appears, the pipeline breathes.
 */
export function makeGoldenProbe(size = 3) {
  return cubeMesh({ center: [0, size / 2, 0], size: [size, size, size], color: [1, 0.84, 0.2, 1] });
}

export function inspectMesh(mesh, options) {
  return { validation: validateMesh(mesh, options), summary: summarizeMesh(mesh) };
}
