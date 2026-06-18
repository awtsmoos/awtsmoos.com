// B"H
/**
 * @file ActivityBands.js
 * @description Chapter 449: distance becomes mercy. The nearby spark receives
 * every heartbeat; the far spark sleeps, still held by the Awtsmoos, no longer
 * stealing frames from the living moment.
 */
export const DEFAULT_ACTIVITY_BANDS = Object.freeze([
  Object.freeze({ name:"full", radius:18, cadence:1 }),
  Object.freeze({ name:"slow", radius:45, cadence:6 }),
  Object.freeze({ name:"idle", radius:90, cadence:30 }),
  Object.freeze({ name:"sleep", radius:Infinity, cadence:Infinity })
]);
export function activityBandForDistanceSq(distanceSq, bands = DEFAULT_ACTIVITY_BANDS) {
  for (const band of bands) if (distanceSq <= band.radius * band.radius) return band;
  return bands[bands.length - 1];
}
export function shouldTickBand(frame, band) {
  return band.cadence === 1 || (Number.isFinite(band.cadence) && frame % band.cadence === 0);
}
export function bandNameForPoint(px, pz, x, z, bands = DEFAULT_ACTIVITY_BANDS) {
  return activityBandForDistanceSq((px - x) ** 2 + (pz - z) ** 2, bands).name;
}
