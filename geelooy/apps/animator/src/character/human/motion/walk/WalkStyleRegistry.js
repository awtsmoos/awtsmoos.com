
// B"H

/**
 * @file WalkStyleRegistry.js
 * @description
 * ============================================================================
 * CHAPTER: THE MANY WAYS FEET CROSS THE EARTH
 * ============================================================================
 *
 * Walking is personality translated into contact, lift, stride, pelvis, arms,
 * and head stabilization. Each style is data, so realism can grow without
 * rewriting the engine.
 *
 * @module WalkStyleRegistry
 */

/**
 * @constant WALK_STYLE_REGISTRY
 * @description
 * Human walk profile data.
 */
export const WALK_STYLE_REGISTRY = {
  calmWalk: { speed: 1.45, stride: 28, lift: 9, contact: 0.58, hip: 4, shoulder: 5, headStability: 0.82 },
  quickWalk: { speed: 2.05, stride: 34, lift: 12, contact: 0.52, hip: 6, shoulder: 8, headStability: 0.7 },
  heavyWalk: { speed: 1.12, stride: 30, lift: 7, contact: 0.68, hip: 8, shoulder: 4, headStability: 0.62 },
  tiredWalk: { speed: 0.95, stride: 22, lift: 5, contact: 0.7, hip: 5, shoulder: 2, headStability: 0.5 },
  joyfulWalk: { speed: 1.85, stride: 36, lift: 16, contact: 0.5, hip: 9, shoulder: 11, headStability: 0.75 },
  nervousWalk: { speed: 2.25, stride: 24, lift: 10, contact: 0.46, hip: 3, shoulder: 10, headStability: 0.55 },
  majesticWalk: { speed: 1.05, stride: 38, lift: 11, contact: 0.62, hip: 4, shoulder: 7, headStability: 0.94 },
  sneakyWalk: { speed: 1.25, stride: 20, lift: 6, contact: 0.74, hip: 2, shoulder: 3, headStability: 0.88 },
  elderWalk: { speed: 0.82, stride: 19, lift: 4, contact: 0.76, hip: 3, shoulder: 2, headStability: 0.6 },
  dancingWalk: { speed: 2.15, stride: 32, lift: 20, contact: 0.48, hip: 14, shoulder: 16, headStability: 0.66 }
};
