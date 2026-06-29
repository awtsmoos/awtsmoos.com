// B"H
import { WHITE, mesh } from './core.js';

/** B"H: A star is a small argument that darkness never owned the sky. */
export function starMesh({ points = 5, outer = 1, inner = 0.45, height = 0.55, color = WHITE } = {}) {
  const p = [0, height, 0, 0, -height, 0];
  const i = [];
  const n = Math.max(3, points | 0) * 2;
  for (let s = 0; s < n; s += 1) {
    const r = s % 2 ? inner : outer;
    const a = s / n * Math.PI * 2;
    p.push(Math.cos(a) * r, 0, Math.sin(a) * r);
  }
  for (let s = 0; s < n; s += 1) {
    const a = 2 + s;
    const b = 2 + ((s + 1) % n);
    i.push(0, a, b, 1, b, a);
  }
  return mesh(p, i, color);
}
