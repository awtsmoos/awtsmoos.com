
// B"H

/**
 * @file HumanMotionProfiles.js
 * @description
 * ============================================================================
 * CHAPTER: MANY SOULS, MANY WALKS
 * ============================================================================
 *
 * Data gives variety without chaos. Each profile bends stride, blink, posture,
 * sway, gesture speed, and speech intensity into a distinct living vessel.
 *
 * @module HumanMotionProfiles
 */

/**
 * @constant HUMAN_MOTION_PROFILES
 * @description
 * Reusable human performance profiles.
 */
export const HUMAN_MOTION_PROFILES = {
  calm: {
    stride: 0.92,
    lift: 0.86,
    posture: 0.1,
    sway: 0.55,
    blink: 1,
    gesture: 0.72,
    speech: 0.78
  },
  energetic: {
    stride: 1.14,
    lift: 1.18,
    posture: 0.24,
    sway: 1.12,
    blink: 1.16,
    gesture: 1.35,
    speech: 1.22
  },
  intense: {
    stride: 1.04,
    lift: 1.05,
    posture: -0.12,
    sway: 0.8,
    blink: 0.84,
    gesture: 1.48,
    speech: 1.36
  },
  gentle: {
    stride: 0.82,
    lift: 0.72,
    posture: 0.18,
    sway: 0.42,
    blink: 1.22,
    gesture: 0.58,
    speech: 0.64
  }
};
