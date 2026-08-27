
// B"H

/**
 * @file BrowExpressionRegistry.js
 * @description
 * ============================================================================
 * CHAPTER: THE BOOK OF BROW MOODS
 * ============================================================================
 *
 * Happy arches, angry compression, sad inner lift, confused asymmetry, focused
 * pinch. The brow speaks before the mouth.
 *
 * @module BrowExpressionRegistry
 */

/**
 * @constant BROW_EXPRESSION_REGISTRY
 * @description
 * Data-based brow expressions.
 */
export const BROW_EXPRESSION_REGISTRY = {
  calm: {
    leftInnerLift: 0,
    leftOuterLift: 0.03,
    rightInnerLift: 0,
    rightOuterLift: 0.03,
    pinch: 0,
    compression: 0
  },
  happy: {
    leftInnerLift: 0.08,
    leftOuterLift: 0.18,
    rightInnerLift: 0.08,
    rightOuterLift: 0.18,
    pinch: 0,
    compression: -0.05
  },
  angry: {
    leftInnerLift: -0.28,
    leftOuterLift: -0.08,
    rightInnerLift: -0.28,
    rightOuterLift: -0.08,
    pinch: 0.58,
    compression: 0.42,
    wrinkleIntensity: 0.4
  },
  sad: {
    leftInnerLift: 0.28,
    leftOuterLift: -0.18,
    rightInnerLift: 0.28,
    rightOuterLift: -0.18,
    pinch: 0.18,
    compression: 0.05
  },
  surprised: {
    leftInnerLift: 0.48,
    leftOuterLift: 0.52,
    rightInnerLift: 0.48,
    rightOuterLift: 0.52,
    pinch: 0,
    compression: -0.15,
    wrinkleIntensity: 0.28
  },
  confused: {
    leftInnerLift: 0.34,
    leftOuterLift: 0.2,
    rightInnerLift: -0.08,
    rightOuterLift: -0.04,
    asymmetry: 0.75,
    pinch: 0.22,
    compression: 0.12
  },
  focused: {
    leftInnerLift: -0.08,
    rightInnerLift: -0.08,
    leftOuterLift: 0.02,
    rightOuterLift: 0.02,
    pinch: 0.28,
    compression: 0.18
  }
};
