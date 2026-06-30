// B"H

/** The circle constant, a quiet orbit around the hidden point. */
export const TAU = Math.PI * 2;

/** Clamp a number inside the vessel that can hold it. */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Measure a two-dimensional breath. */
export function len(x, y) {
  return Math.hypot(x, y);
}

/** Normalize a movement vector without letting zero become chaos. */
export function norm(v) {
  const d = len(v.x, v.y) || 1;
  return { x: v.x / d, y: v.y / d };
}

/** Distance between two world vessels. */
export function dist(a, b) {
  return len(a.x - b.x, a.y - b.y);
}

/** Linear interpolation: the finite learning to approach revelation. */
export function mix(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

/** Deterministic pseudo-random spark from a seed. */
export function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Terrain height: a soft interference pattern under the running spark. */
export function heightAt(x, y, world = 0) {
  return Math.sin((x + world * 70) * 0.004) * 18 + Math.cos((y - world * 80) * 0.003) * 14 + Math.sin((x + y) * 0.002) * 10;
}

/** Convert HSL into shader-ready RGB values. */
export function hsl(h, s = 82, l = 62) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

/** Perspective matrix for the WebGL ascent. */
export function perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}

/** Camera matrix: look from eye toward center. */
export function lookAt(eye, center) {
  const z = unit([eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]]);
  const x = unit([z[2], 0, -z[0]]);
  const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
}

/** Multiply two 4x4 matrices in column-major WebGL order. */
export function mul(a, b) {
  const out = Array(16).fill(0);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let k = 0; k < 4; k++) out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return out;
}

function unit(v) {
  const d = Math.hypot(...v) || 1;
  return v.map(n => n / d);
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
