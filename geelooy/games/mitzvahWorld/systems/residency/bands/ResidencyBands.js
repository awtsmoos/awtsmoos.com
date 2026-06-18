// B"H
/**
 * @file ResidencyBands.js
 * @description Chapter 457: nearness becomes law; cold sectors sleep without
 * being forgotten, and hysteresis forbids border-thrashing madness.
 */
export const DEFAULT_RESIDENCY_BANDS = Object.freeze([
  Object.freeze({ name:"core", load:1, unload:2, collider:"full", lod:0, tick:"full" }),
  Object.freeze({ name:"near", load:2, unload:3, collider:"full", lod:1, tick:"slow" }),
  Object.freeze({ name:"warm", load:4, unload:5, collider:"coarse", lod:2, tick:"schedule" }),
  Object.freeze({ name:"far", load:7, unload:8, collider:"bounds", lod:3, tick:"catchup" })
]);
export function bandForSectorDistance(distanceSectors, bands = DEFAULT_RESIDENCY_BANDS) {
  const d = Math.max(0, Number(distanceSectors) || 0);
  return bands.find(band => d <= band.load) || null;
}
export function shouldUnload(distanceSectors, band) {
  return !band || distanceSectors > band.unload;
}
export function maxLoadRadius(bands = DEFAULT_RESIDENCY_BANDS) {
  return Math.max(...bands.map(band => band.load));
}
