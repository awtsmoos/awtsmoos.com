/**
 * B"H
 * Capsule math helpers.
 *
 * Chapter 126: every point is a small spark of order. The Awtsmoos gives us
 * clamp, lerp, and distance so the visual body can become calm and exact.
 */
export function point(x, y) {
  return { x, y };
}

export function good(p) {
  return p && Number.isFinite(p.x) && Number.isFinite(p.y);
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

export function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

export function mix(a, b, t) {
  return point(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
}

export function add(a, x, y) {
  return point(a.x + x, a.y + y);
}

export function dist(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function toward(a, b, len) {
  const d = dist(a, b) || 1;
  return point(a.x + (b.x - a.x) / d * len, a.y + (b.y - a.y) / d * len);
}
