import { cubeMesh } from '../mesh/primitives.js';

/**
 * B"H
 * @chapter A tower wanted to become a purple scream; the clamp taught it humility.
 */
export function buildingMesh(opts = {}) {
  const width = clamp(opts.width ?? 4, 0.5, 24);
  const depth = clamp(opts.depth ?? 4, 0.5, 24);
  const height = clamp(opts.height ?? 8, 1, opts.maxHeight ?? 60);
  const x = opts.x ?? 0;
  const z = opts.z ?? 0;
  return cubeMesh({ center: [x, height / 2, z], size: [width, height, depth], color: opts.color ?? [0.55, 0.25, 0.9, 1] });
}

export function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}
