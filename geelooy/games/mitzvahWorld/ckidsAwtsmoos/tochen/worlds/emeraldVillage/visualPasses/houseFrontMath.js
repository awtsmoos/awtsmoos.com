// B"H
/**
 * @file houseFrontMath.js
 * @description Chapter 332: Every house front is calculated in one pure place,
 * so doors, shutters, awnings, laundry, and jars agree.
 */
export function houseFront(prop) {
  const z = prop.center.z, depth = prop.lot?.depth || 40;
  return { front: z >= 0 ? z - depth / 2 - 6 : z + depth / 2 + 6, sign: z >= 0 ? -1 : 1 };
}
