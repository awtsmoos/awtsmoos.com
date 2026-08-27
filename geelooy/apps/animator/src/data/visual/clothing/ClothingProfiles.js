// B"H

/**
 * @file ClothingProfiles.js
 * @description
 * ============================================================================
 * CHAPTER: THE GARMENTS THAT STOPPED FLOATING LIKE BROKEN PANELS
 * ============================================================================
 *
 * Clothing is not random color slapped onto a body. A jacket has lapels,
 * shoulder seams, cuffs, buttons, folds, and weight. A robe has a sash, hem,
 * inner fold, and readable mass. This data keeps clothing modular and human.
 *
 * The Awtsmoos gives form to garments and bodies alike. The garment is a vessel
 * around a vessel, concealment that reveals the posture beneath it.
 */

export const CLOTHING_PROFILES = {
  blazer_modern: {
    id: 'blazer_modern',
    type: 'jacket',
    torso: { shoulderAdd: 3, waistAdd: 5, chestCurve: 9 },
    lapels: { width: 16, length: 67, open: 11 },
    collar: { width: 22, height: 24 },
    buttons: [
      { x: 0, yOffset: 36, r: 2.4 },
      { x: 0, yOffset: 54, r: 2.3 }
    ],
    cuffs: { width: 9, height: 5 },
    foldLines: [
      { side: -1, x: -17, y1Offset: 18, y2Offset: 78 },
      { side: 1, x: 17, y1Offset: 18, y2Offset: 78 }
    ]
  },

  fitted_cardigan: {
    id: 'fitted_cardigan',
    type: 'jacket',
    torso: { shoulderAdd: 1, waistAdd: 2, chestCurve: 6 },
    lapels: { width: 10, length: 58, open: 8 },
    collar: { width: 19, height: 20 },
    buttons: [
      { x: 0, yOffset: 32, r: 2.1 },
      { x: 0, yOffset: 48, r: 2.1 },
      { x: 0, yOffset: 64, r: 2.1 }
    ],
    cuffs: { width: 8, height: 5 },
    foldLines: [
      { side: -1, x: -14, y1Offset: 20, y2Offset: 72 },
      { side: 1, x: 14, y1Offset: 20, y2Offset: 72 }
    ]
  },

  sage_robe: {
    id: 'sage_robe',
    type: 'robe',
    torso: { shoulderAdd: 5, waistAdd: 12, chestCurve: 8 },
    lapels: { width: 14, length: 82, open: 10 },
    collar: { width: 22, height: 22 },
    sash: { yOffset: 82, width: 68, stroke: 7 },
    robeHem: { width: 86, yOffset: 162 },
    foldLines: [
      { side: -1, x: -22, y1Offset: 18, y2Offset: 144 },
      { side: 0, x: 0, y1Offset: 24, y2Offset: 150 },
      { side: 1, x: 22, y1Offset: 18, y2Offset: 144 }
    ]
  }
};