// B"H
import { WHITE, mesh, onPlane, safeSegments } from './core.js';

/** B"H: Flat things are not dead; they are quiet stages for revelation. */
export function planeMesh({ size = 2, y = 0, color = WHITE } = {}) {
  const s = Math.max(0.001, Math.abs(size)) / 2;
  return mesh([-s, y, -s, s, y, -s, s, y, s, -s, y, s], [0, 1, 2, 0, 2, 3], color);
}

export function discMesh({ radius = 1, segments = 48, y = 0, color = WHITE } = {}) {
  const p = [0, y, 0];
  const i = [];
  const n = safeSegments(segments, 8);
  for (let s = 0; s < n; s += 1) {
    const a = s / n * Math.PI * 2;
    p.push(Math.cos(a) * radius, y, Math.sin(a) * radius);
    i.push(0, s + 1, ((s + 1) % n) + 1);
  }
  return mesh(p, i, color);
}

export function ringMesh({ outer = 1, inner = 0.68, segments = 48, plane = 'xz', color = WHITE } = {}) {
  const p = [];
  const i = [];
  const n = safeSegments(segments, 8);
  const a = Math.max(0.001, Math.abs(outer));
  const b = Math.max(0.001, Math.min(a * 0.95, Math.abs(inner)));
  for (let s = 0; s < n; s += 1) {
    const t = s / n * Math.PI * 2;
    p.push(...onPlane(Math.cos(t) * a, Math.sin(t) * a, plane));
    p.push(...onPlane(Math.cos(t) * b, Math.sin(t) * b, plane));
  }
  for (let s = 0; s < n; s += 1) {
    const o = s * 2;
    const next = ((s + 1) % n) * 2;
    i.push(o, next, next + 1, o, next + 1, o + 1);
  }
  return mesh(p, i, color);
}
