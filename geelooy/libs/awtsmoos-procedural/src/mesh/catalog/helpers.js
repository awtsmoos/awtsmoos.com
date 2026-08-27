// B"H
import { cubeMesh } from '../primitives.js';
import { transformMesh } from '../transform.js';

/** B"H: A bar is a humble beam, waiting to become a gate or a letter. */
export function bar(translate, scale, tilt = 0) {
  const current = transformMesh(cubeMesh(), { scale, translate });
  if (!tilt) return current;
  const positions = current.positions.map((value, i) => (i % 3 === 0 ? value + current.positions[i + 1] * tilt : value));
  return { ...current, positions };
}
