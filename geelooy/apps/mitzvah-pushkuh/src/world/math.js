// B"H
// Math is the measured breath under the miracle.
export function hash(s) {
  return [...String(s)].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0) >>> 0;
}
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export function groupByPath(rows) {
  const map = new Map();
  rows.forEach(row => (map.get(row.entry.type) || map.set(row.entry.type, []).get(row.entry.type)).push(row));
  return map;
}
export function cssPoint(rect, dpr, x, y) {
  return { x: (x - rect.left) * dpr, y: (y - rect.top) * dpr };
}
export function canvasPoint(canvas, x, y, dpr = devicePixelRatio || 1) {
  const r = canvas.getBoundingClientRect();
  return cssPoint(r, dpr, x, y);
}
