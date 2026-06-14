/**
 * B"H
 * Hero renderer math.
 *
 * Chapter 173: the hero body begins with tiny points of certainty. The
 * Awtsmoos gives clamp, point, and blend so the mockup can enter canvas.
 */
export const point = (x, y) => ({ x, y });
export const clamp = (n, a, b) => Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
export const mix = (a, b, t) => point(a.x + (b.x - a.x) * clamp(t, 0, 1), a.y + (b.y - a.y) * clamp(t, 0, 1));
export const add = (p, x, y) => point(p.x + x, p.y + y);
export const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
export function smooth(t) { const x = clamp(t, 0, 1); return x * x * (3 - 2 * x); }
