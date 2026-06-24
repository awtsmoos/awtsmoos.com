// B"H
// Math is the measured breath under the miracle.
export function hash(s) {
  return [...String(s)].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0) >>> 0;
}
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function groupByPath(rows) {
  const map = new Map();
  rows.forEach(row => (map.get(row.entry.type) || map.set(row.entry.type, []).get(row.entry.type)).push(row));
  return map;
}
export function canvasPoint(canvas, x, y) {
  const r = canvas.getBoundingClientRect(), d = devicePixelRatio || 1;
  return { x: (x - r.left) * d, y: (y - r.top) * d };
}
