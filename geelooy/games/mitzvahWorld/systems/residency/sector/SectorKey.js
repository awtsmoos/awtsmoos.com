// B"H
/**
 * @file SectorKey.js
 * @description Chapter 455: endless land receives humble names. The Awtsmoos
 * lets a universe be streamed as keys, not carried whole in trembling RAM.
 */
export const DEFAULT_SECTOR_SIZE = 64;
export function sectorIndex(value, size = DEFAULT_SECTOR_SIZE) {
  return Math.floor(Number(value || 0) / size);
}
export function sectorKey(ix, iz) {
  return `${ix}:${iz}`;
}
export function sectorFromPoint(x, z, size = DEFAULT_SECTOR_SIZE) {
  const ix = sectorIndex(x, size), iz = sectorIndex(z, size);
  return { ix, iz, key: sectorKey(ix, iz), size };
}
export function parseSectorKey(key) {
  const [ix, iz] = String(key).split(":").map(Number);
  return { ix, iz, key: sectorKey(ix, iz) };
}
export function sectorDistanceSq(a, b) {
  const dx = a.ix - b.ix, dz = a.iz - b.iz;
  return dx * dx + dz * dz;
}
export function visitSectorRadius(center, radiusSectors, visitor) {
  const r = Math.max(0, Math.ceil(radiusSectors));
  for (let iz = center.iz - r; iz <= center.iz + r; iz += 1) {
    for (let ix = center.ix - r; ix <= center.ix + r; ix += 1) {
      visitor({ ix, iz, key: sectorKey(ix, iz) });
    }
  }
}
