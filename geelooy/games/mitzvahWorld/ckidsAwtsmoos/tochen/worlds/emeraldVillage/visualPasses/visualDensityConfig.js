// B"H
/**
 * @file visualDensityConfig.js
 * @description Chapter 497: Density profiles now leave real mobile headroom.
 * The Awtsmoos trims optional tiny props before the phone begins to sweat.
 */
export const VISUAL_DENSITY = Object.freeze({
  ultraLow: Object.freeze({ marketScale: 0.35, roadScale: 0.35, houseScale: 0.45, sparkleScale: 0.45, pathScale: 0.45, flowerScale: 0.45, crowdScale: 0.35, districtScale: 0.45, vistaScale: 0.65 }),
  mobile: Object.freeze({ marketScale: 0.55, roadScale: 0.65, houseScale: 0.68, sparkleScale: 0.65, pathScale: 0.68, flowerScale: 0.62, crowdScale: 0.65, districtScale: 0.69, vistaScale: 0.85 }),
  balanced: Object.freeze({ marketScale: 1, roadScale: 1, houseScale: 1, sparkleScale: 1, pathScale: 1, flowerScale: 1, crowdScale: 1, districtScale: 1, vistaScale: 1 }),
  desktop: Object.freeze({ marketScale: 1, roadScale: 1, houseScale: 1, sparkleScale: 1, pathScale: 1, flowerScale: 1, crowdScale: 1, districtScale: 1, vistaScale: 1 }),
  epic: Object.freeze({ marketScale: 1, roadScale: 1, houseScale: 1, sparkleScale: 1, pathScale: 1, flowerScale: 1, crowdScale: 1, districtScale: 1, vistaScale: 1 })
});
export function visualDensity(profile = {}) { return VISUAL_DENSITY[profile.visualDensity] || VISUAL_DENSITY.mobile; }
export function scaledCount(total, scale, min = 0) { return Math.max(min, Math.min(total, Math.ceil(total * scale))); }
