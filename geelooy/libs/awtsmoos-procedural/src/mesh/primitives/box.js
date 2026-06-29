// B"H
import { WHITE, mesh } from './core.js';

/**
 * B"H
 * Six faces stand like six directions, each one admitting it is only a vessel.
 */
export function cubeMesh({ center = [0, 0, 0], size = [1, 1, 1], color = WHITE } = {}) {
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = size.map(value => Math.max(0.001, Math.abs(value)) / 2);
  const p = [
    cx - sx, cy - sy, cz - sz, cx + sx, cy - sy, cz - sz,
    cx + sx, cy + sy, cz - sz, cx - sx, cy + sy, cz - sz,
    cx - sx, cy - sy, cz + sz, cx + sx, cy - sy, cz + sz,
    cx + sx, cy + sy, cz + sz, cx - sx, cy + sy, cz + sz
  ];
  const i = [
    0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6,
    0, 4, 5, 0, 5, 1, 3, 2, 6, 3, 6, 7,
    1, 5, 6, 1, 6, 2, 0, 3, 7, 0, 7, 4
  ];
  return mesh(p, i, color);
}
