// B"H
/**
 * @file SectorBounds.js
 * @description Chapter 456: every sector receives edges, so the revealed world
 * can breathe in bounded vessels instead of infinite searching.
 */
import { DEFAULT_SECTOR_SIZE, parseSectorKey } from "./SectorKey.js";
export function boundsForSector(key, size = DEFAULT_SECTOR_SIZE) {
  const { ix, iz } = typeof key === "string" ? parseSectorKey(key) : key;
  return { key:`${ix}:${iz}`, ix, iz, minX:ix * size, minZ:iz * size, maxX:(ix + 1) * size, maxZ:(iz + 1) * size, size };
}
export function centerOfBounds(bounds) {
  return { x:(bounds.minX + bounds.maxX) * 0.5, z:(bounds.minZ + bounds.maxZ) * 0.5 };
}
export function containsPoint(bounds, x, z) {
  return x >= bounds.minX && x < bounds.maxX && z >= bounds.minZ && z < bounds.maxZ;
}
export function expandBounds(bounds, margin) {
  return { ...bounds, minX:bounds.minX - margin, minZ:bounds.minZ - margin, maxX:bounds.maxX + margin, maxZ:bounds.maxZ + margin };
}
