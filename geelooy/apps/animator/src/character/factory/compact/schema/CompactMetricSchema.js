
// B"H
import { CompactGroundSchema } from './CompactGroundSchema.js';

/**
 * @file CompactMetricSchema.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: ONE SKELETON, MANY VESSELS
 * ═══════════════════════════════════════════════════════════════
 *
 * The compact path fixed the tower, but proportions were too small and the
 * scene still felt empty. This schema makes characters larger, grounded, and
 * clear on mobile.
 *
 * The Awtsmoos creates hierarchy from crown to heel. These metrics are that
 * hierarchy in pixels: head, neck, shoulders, torso, hips, knees, feet.
 *
 * @class CompactMetricSchema
 */
export class CompactMetricSchema {
  /**
   * Returns compact human metrics.
   *
   * @returns {Object} Human metrics.
   */
  static human() {
    const g = CompactGroundSchema.get();
    return {
      ...g,
      topY: -330,
      headY: -268,
      headRX: 46,
      headRY: 56,
      neckTopY: -222,
      neckBottomY: -196,
      shoulderY: -188,
      chestY: -150,
      waistY: -82,
      hipY: -67,
      shoulderW: 96,
      hipW: 46,
      torsoTopW: 82,
      torsoBottomW: 54,
      armUpper: 58,
      armLower: 52,
      legUpper: 35,
      legLower: 32,
      bounds: { left: -70, right: 70, top: -330, bottom: 18 }
    };
  }

  /**
   * Returns compact sage metrics.
   *
   * @returns {Object} Sage metrics.
   */
  static sage() {
    const g = CompactGroundSchema.get();
    return {
      ...g,
      topY: -322,
      headY: -262,
      headRX: 42,
      headRY: 47,
      neckTopY: -222,
      neckBottomY: -198,
      shoulderY: -188,
      robeTopY: -190,
      robeBottomY: -58,
      hipY: -68,
      shoulderW: 94,
      hipW: 48,
      armUpper: 58,
      armLower: 52,
      legUpper: 36,
      legLower: 33,
      beardBottomY: -92,
      bounds: { left: -72, right: 72, top: -322, bottom: 18 }
    };
  }
}
