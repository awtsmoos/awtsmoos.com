/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE LAWS OF GROWTH — NatureRules.js
 *   ────────────────────────────────────────
 *   Point 7 of the 32 Emanations.
 *   Defines the procedural logic for flora and environmental assets.
 * ════════════════════════════════════════════════════════════════════════
 */

export const NATURE_RULES = {
  grass: {
    validSurfaces: ['terrain'],
    maxSlope: 30, // degrees
    density: {
      base: 0.8,
      noiseInfluence: 0.5
    },
    animation: {
      swaySpeed: 1.0,
      swayIntensity: 0.2
    }
  },
  
  trees: {
    validSurfaces: ['terrain'],
    minDistanceBetween: 5,
    probability: 0.05,
    variations: [
      { type: 'oak', scaleRange: [0.8, 1.5] },
      { type: 'pine', scaleRange: [1.2, 2.0] }
    ]
  },

  flowers: {
    validSurfaces: ['terrain'],
    clusters: {
      minSize: 3,
      maxSize: 8
    }
  }
};
