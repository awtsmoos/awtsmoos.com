// B"H
/**
 * @file profiles.js
 * @description Chapter 473: Emerald compile profiles now include an ultra-low
 * vessel for old phones. Beauty remains, but the load is reduced before it is
 * born.
 */
export const PROFILES = Object.freeze({
  ultraLow: { extraProperties: 16, wildTrees: 60, mazikim: 12, terrainSegments: 32, terrainSize: 2200, seed: 7701, visualDensity: 'ultraLow' },
  mobile: { extraProperties: 36, wildTrees: 114, mazikim: 32, terrainSegments: 64, terrainSize: 3000, seed: 7701, visualDensity: 'mobile' },
  balanced: { extraProperties: 96, wildTrees: 260, mazikim: 72, terrainSegments: 96, terrainSize: 4200, seed: 7701, visualDensity: 'balanced' },
  desktop: { extraProperties: 180, wildTrees: 520, mazikim: 120, terrainSegments: 128, terrainSize: 5600, seed: 7701, visualDensity: 'desktop' },
  epic: { extraProperties: 300, wildTrees: 1000, mazikim: 200, terrainSegments: 128, terrainSize: 6000, seed: 7701, visualDensity: 'epic' }
});
export function resolveProfile(options = {}) {
  const base = PROFILES[options.profile] || PROFILES.balanced;
  return { ...base, ...options, seed: Number(options.seed ?? base.seed), visualDensity: options.visualDensity || base.visualDensity || 'balanced' };
}
