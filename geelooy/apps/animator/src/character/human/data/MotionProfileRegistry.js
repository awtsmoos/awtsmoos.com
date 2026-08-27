
// B"H

/**
 * @file MotionProfileRegistry.js
 * @description
 * ============================================================================
 * CHAPTER: MANY WALKS, MANY SOULS, ONE ENGINE
 * ============================================================================
 *
 * A living person is not one sine wave repeated forever. Calm, energetic,
 * intense, gentle, tired, joyful, cautious — each has a gait, breath, blink,
 * gesture, and speech rhythm. This registry makes realism easy by data.
 *
 * @module MotionProfileRegistry
 */

/**
 * @constant MOTION_PROFILE_REGISTRY
 * @description
 * Human motion profiles used by factories, NLE, and performance layers.
 */
export const MOTION_PROFILE_REGISTRY = {
  calm: {
    stride: 0.92,
    lift: 0.86,
    posture: 0.1,
    sway: 0.55,
    blink: 1,
    gesture: 0.72,
    speech: 0.78,
    breath: 0.7
  },
  energetic: {
    stride: 1.14,
    lift: 1.18,
    posture: 0.24,
    sway: 1.12,
    blink: 1.16,
    gesture: 1.35,
    speech: 1.22,
    breath: 1.3
  },
  intense: {
    stride: 1.04,
    lift: 1.05,
    posture: -0.12,
    sway: 0.8,
    blink: 0.84,
    gesture: 1.48,
    speech: 1.36,
    breath: 1.1
  },
  gentle: {
    stride: 0.82,
    lift: 0.72,
    posture: 0.18,
    sway: 0.42,
    blink: 1.22,
    gesture: 0.58,
    speech: 0.64,
    breath: 0.62
  },
  joyfulDance: {
    stride: 1.22,
    lift: 1.34,
    posture: 0.3,
    sway: 1.72,
    blink: 1.08,
    gesture: 1.8,
    speech: 1.1,
    breath: 1.55
  }
};
