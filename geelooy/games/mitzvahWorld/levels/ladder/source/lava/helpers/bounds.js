// B"H
/** @file bounds.js @description Chapter 578: Measures a handmade course. */
export function bounds(platforms) {
  const xs = platforms.map(p => p.position.x), zs = platforms.map(p => p.position.z);
  return { minX: Math.min(...xs) - 8, maxX: Math.max(...xs) + 8, minZ: Math.min(...zs) - 8, maxZ: Math.max(...zs) + 8 };
}
