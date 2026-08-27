// B"H

/**
 * @file StableRigMetrics.js
 * @description
 * ============================================================================
 * CHAPTER: THE HUMAN PROPORTION TABLE
 * ============================================================================
 *
 * These metrics keep heads round, feet visible, legs readable, torsos grounded,
 * and side view human instead of pancake.
 *
 * @class StableRigMetrics
 */
export class StableRigMetrics {
  /**
   * Human metrics.
   *
   * @returns {Object} Metrics.
   */
  static human() {
    return {
      headRX: 33,
      headRY: 40,
      headY: -250,
      neckTopY: -219,
      neckBottomY: -203,
      shoulderY: -198,
      chestY: -166,
      waistY: -118,
      hipY: -91,
      kneeY: -46,
      ankleY: -8,
      footY: 6,
      shoulderHalf: 43,
      hipHalf: 27,
      armWidth: 12,
      legWidth: 13,
      shadowRX: 38,
      shadowRY: 7,
      handFloorY: -62,
      robeBottomY: -42,
      beardBottomY: -156
    };
  }

  /**
   * Sage metrics.
   *
   * @returns {Object} Metrics.
   */
  static sage() {
    return {
      ...this.human(),
      headRX: 35,
      headRY: 43,
      headY: -256,
      shoulderY: -202,
      robeBottomY: -40,
      beardBottomY: -150,
      shadowRX: 40
    };
  }
}