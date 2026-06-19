
// B"H

/**
 * @file ClothingProfileRegistry.js
 * @description
 * ============================================================================
 * CHAPTER: THE GARMENTS THAT LEARNED NOT TO ERASE THE LEGS
 * ============================================================================
 *
 * Robes, coats, jackets, beards, hats, sleeves — all are vessels. But a garment
 * must not devour the body it reveals. These profiles declare draw order, leg
 * windows, beard limits, and readable silhouettes.
 *
 * @module ClothingProfileRegistry
 */

/**
 * @constant CLOTHING_PROFILE_REGISTRY
 * @description
 * Data-based clothing profiles.
 */
export const CLOTHING_PROFILE_REGISTRY = {
  chossidBlackCoat: {
    coatLength: 112,
    coatWidth: 72,
    legWindow: 42,
    sleeveWidth: 18,
    beardMaxLength: 74,
    hat: 'black_hat',
    colors: {
      coat: '#101014',
      shirt: '#f7f2e8',
      pants: '#11121a',
      shoes: '#050507',
      beard: '#2d241b',
      hat: '#08080b'
    },
    drawOrder: [
      'farLeg',
      'farShoe',
      'farArm',
      'torsoBase',
      'shirt',
      'coatBack',
      'nearLeg',
      'nearShoe',
      'coatFront',
      'nearArm',
      'beard',
      'head',
      'face',
      'hat'
    ]
  },
  purpleJacket: {
    coatLength: 78,
    coatWidth: 68,
    legWindow: 64,
    sleeveWidth: 16,
    beardMaxLength: 0,
    hat: 'none',
    colors: {
      coat: '#714cff',
      shirt: '#f9eee2',
      pants: '#1b1930',
      shoes: '#090914',
      beard: '#000000',
      hat: '#000000'
    },
    drawOrder: [
      'farLeg',
      'farShoe',
      'farArm',
      'torsoBase',
      'shirt',
      'coatBack',
      'nearLeg',
      'nearShoe',
      'coatFront',
      'nearArm',
      'head',
      'face',
      'hair'
    ]
  }
};
