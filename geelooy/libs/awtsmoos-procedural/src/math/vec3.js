/**
 * B"H
 * @chapter Three coordinates sang, and the void admitted they were a point.
 */
export const v3 = (x = 0, y = 0, z = 0) => [x, y, z];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
export function length(a) {
  return Math.hypot(a[0], a[1], a[2]);
}
export function normalize(a) {
  const len = length(a) || 1;
  return [a[0] / len, a[1] / len, a[2] / len];
}
export function isFiniteVec3(a) {
  return Array.isArray(a) && a.length === 3 && a.every(Number.isFinite);
}
