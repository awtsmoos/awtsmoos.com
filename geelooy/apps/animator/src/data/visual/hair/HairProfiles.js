// B"H

/**
 * @file HairProfiles.js
 * @description
 * ============================================================================
 * CHAPTER: THE HAIR THAT STOPPED BLINDING THE FACE
 * ============================================================================
 *
 * Hair may frame the face. Hair may move. Hair may give age, style, silhouette,
 * culture, energy, and individuality. But hair must never murder the eyes,
 * bury the mouth, or smear across the face like spilled ink.
 *
 * This file is pure data. Every hairstyle has a skull cap, side locks, front
 * locks, and strict face-safety rules. The Awtsmoos creates every strand from
 * nothing every instant, yet every strand receives a boundary so expression can
 * shine through the vessel.
 */

export const HAIR_PROFILES = {
  neat_side_part: {
    id: 'neat_side_part',
    cap: { rxAdd: 5, ryAdd: 7, y: -7, colorRole: 'hairDark' },
    hairline: { y: -33, width: 48, lift: 7 },
    sideLocks: [
      { side: -1, x: -29, y: -20, length: 46, width: 8, curve: -9 },
      { side: 1, x: 29, y: -18, length: 42, width: 8, curve: 7 }
    ],
    bangs: [
      { x: -14, y: -37, length: 18, width: 7, curve: -5 },
      { x: -2, y: -38, length: 15, width: 7, curve: 2 },
      { x: 11, y: -36, length: 12, width: 6, curve: 5 }
    ],
    faceClearance: { minEyeY: -25, maxBangLength: 20 }
  },

  swept_curls: {
    id: 'swept_curls',
    cap: { rxAdd: 7, ryAdd: 9, y: -8, colorRole: 'hairDark' },
    hairline: { y: -35, width: 52, lift: 10 },
    sideLocks: [
      { side: -1, x: -31, y: -20, length: 50, width: 9, curve: -12 },
      { side: 1, x: 31, y: -18, length: 44, width: 8, curve: 9 }
    ],
    bangs: [
      { x: -20, y: -38, length: 14, width: 8, curve: -8 },
      { x: -8, y: -41, length: 18, width: 8, curve: -2 },
      { x: 5, y: -40, length: 16, width: 8, curve: 4 },
      { x: 18, y: -37, length: 12, width: 7, curve: 8 }
    ],
    faceClearance: { minEyeY: -25, maxBangLength: 19 }
  },

  short_wave: {
    id: 'short_wave',
    cap: { rxAdd: 4, ryAdd: 5, y: -6, colorRole: 'hairDark' },
    hairline: { y: -32, width: 46, lift: 6 },
    sideLocks: [
      { side: -1, x: -28, y: -17, length: 34, width: 7, curve: -5 },
      { side: 1, x: 28, y: -17, length: 34, width: 7, curve: 5 }
    ],
    bangs: [
      { x: -12, y: -34, length: 10, width: 6, curve: -3 },
      { x: 0, y: -35, length: 11, width: 6, curve: 1 },
      { x: 12, y: -34, length: 9, width: 6, curve: 4 }
    ],
    faceClearance: { minEyeY: -25, maxBangLength: 13 }
  },

  sage_silver: {
    id: 'sage_silver',
    cap: { rxAdd: 6, ryAdd: 8, y: -7, colorRole: 'hairDark' },
    hairline: { y: -34, width: 50, lift: 8 },
    sideLocks: [
      { side: -1, x: -32, y: -17, length: 58, width: 9, curve: -10 },
      { side: 1, x: 32, y: -17, length: 58, width: 9, curve: 10 }
    ],
    bangs: [
      { x: -15, y: -37, length: 12, width: 7, curve: -4 },
      { x: 0, y: -38, length: 10, width: 7, curve: 0 },
      { x: 15, y: -37, length: 12, width: 7, curve: 4 }
    ],
    faceClearance: { minEyeY: -25, maxBangLength: 14 }
  }
};