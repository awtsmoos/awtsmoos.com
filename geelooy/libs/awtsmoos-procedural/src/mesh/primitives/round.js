// B"H
import { WHITE, mesh, safeSegments } from './core.js';

/** B"H: Roundness remembers that the Infinite has no corner. */
export function cylinderMesh({ radius = 1, height = 2, segments = 32, color = WHITE } = {}) {
  const p = [0, height / 2, 0, 0, -height / 2, 0];
  const i = [];
  const n = safeSegments(segments, 8);
  for (let s = 0; s < n; s += 1) {
    const a = s / n * Math.PI * 2;
    p.push(Math.cos(a) * radius, height / 2, Math.sin(a) * radius);
    p.push(Math.cos(a) * radius, -height / 2, Math.sin(a) * radius);
  }
  for (let s = 0; s < n; s += 1) {
    const top = 2 + s * 2;
    const bot = top + 1;
    const nt = 2 + ((s + 1) % n) * 2;
    const nb = nt + 1;
    i.push(0, top, nt, 1, nb, bot, top, bot, nb, top, nb, nt);
  }
  return mesh(p, i, color);
}

export function sphereMesh({ radius = 1, rings = 8, segments = 16, color = WHITE } = {}) {
  const p = [];
  const i = [];
  const rows = Math.max(3, rings | 0);
  const cols = safeSegments(segments, 8);
  for (let y = 0; y <= rows; y += 1) {
    const ph = y / rows * Math.PI;
    for (let x = 0; x < cols; x += 1) {
      const th = x / cols * Math.PI * 2;
      p.push(Math.sin(ph) * Math.cos(th) * radius, Math.cos(ph) * radius, Math.sin(ph) * Math.sin(th) * radius);
    }
  }
  for (let y = 0; y < rows; y += 1) for (let x = 0; x < cols; x += 1) {
    const a = y * cols + x;
    const b = y * cols + ((x + 1) % cols);
    const c = (y + 1) * cols + ((x + 1) % cols);
    const d = (y + 1) * cols + x;
    i.push(a, d, c, a, c, b);
  }
  return mesh(p, i, color);
}
