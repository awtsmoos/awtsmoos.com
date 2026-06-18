// B"H
/**
 * @file cellKey.js
 * @description Chapter 446: the flat earth-grid receives names. The Awtsmoos
 * folds endless wandering into small cells, so moving beings are found without
 * searching the whole creation every frame.
 */
export function cellIndex(value, cellSize) {
  return Math.floor(value / cellSize);
}
export function cellKey(ix, iz) {
  return `${ix}:${iz}`;
}
export function visitCircleCells(x, z, radius, cellSize, visitor) {
  const minX = cellIndex(x - radius, cellSize), maxX = cellIndex(x + radius, cellSize);
  const minZ = cellIndex(z - radius, cellSize), maxZ = cellIndex(z + radius, cellSize);
  for (let iz = minZ; iz <= maxZ; iz += 1) for (let ix = minX; ix <= maxX; ix += 1) visitor(ix, iz, cellKey(ix, iz));
}
export function visitAabbCells(minX, minZ, maxX, maxZ, cellSize, visitor) {
  const a = cellIndex(minX, cellSize), b = cellIndex(maxX, cellSize);
  const c = cellIndex(minZ, cellSize), d = cellIndex(maxZ, cellSize);
  for (let iz = c; iz <= d; iz += 1) for (let ix = a; ix <= b; ix += 1) visitor(ix, iz, cellKey(ix, iz));
}
