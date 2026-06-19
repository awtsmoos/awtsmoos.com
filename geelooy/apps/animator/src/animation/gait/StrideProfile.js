// B"H

/**
 * @file StrideProfile.js
 * @description
 * ============================================================================
 * CHAPTER: THE DATA OF HUMAN STEPS
 * ============================================================================
 *
 * Walk and run should not share the same numbers. This data controls stride,
 * lift, body bob, arm pump, and cycle speed.
 */

export const STRIDE_PROFILES = {
  walk: {
    cyclesPerSecond: 1.55,
    stride: 28,
    lift: 10,
    knee: 12,
    bob: 3,
    arm: 17
  },

  run: {
    cyclesPerSecond: 2.85,
    stride: 46,
    lift: 22,
    knee: 24,
    bob: 8,
    arm: 31
  }
};