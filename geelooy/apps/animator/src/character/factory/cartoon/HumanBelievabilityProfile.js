// B"H

/**
 * @file HumanBelievabilityProfile.js
 * @description
 * ============================================================================
 * CHAPTER: THE DATA OF A HUMAN WHO CAN STILL BE A CARTOON
 * ============================================================================
 *
 * Realistic does not mean photographic sludge. Realistic means the viewer feels
 * the body has weight, joints, posture, attention, emotion, and breath. This
 * profile gives a clean 2D cartoon human better human cues: taller legs, real
 * shoulders, tucked neck, larger expressive eyes, stronger hands, grounded feet,
 * and a head that sits on the body instead of floating.
 *
 * The Awtsmoos gives life to matter, but animation must build vessels for that
 * life. These numbers are vessels: not the soul, not the Essence, only faithful
 * measures so the drawn human can feel alive.
 */

export const HUMAN_BELIEVABILITY_PROFILE = {
  proportions: {
    headRX: 34,
    headRY: 41,
    headY: -258,
    neckTopY: -226,
    neckBottomY: -207,
    shoulderY: -203,
    chestY: -175,
    waistY: -122,
    hipY: -96,
    kneeY: -48,
    ankleY: -9,
    footY: 4,
    shoulderHalf: 45,
    hipHalf: 28,
    armWidth: 13,
    legWidth: 13,
    shadowRX: 36,
    shadowRY: 7,
    beardBottomY: -178,
    robeBottomY: -48,
    handFloorY: -72
  },

  expression: {
    eyeScale: 1.08,
    browStrength: 1.18,
    mouthSpeechBoost: 1.25,
    cheekLife: 1.0,
    blinkMinMs: 1800,
    blinkMaxMs: 4200
  },

  motion: {
    idleBreath: 2.4,
    idleSway: 1.8,
    walkLegSwing: 9.5,
    walkArmCounterSwing: 8,
    handGestureReach: 1.16,
    shoulderFollow: 0.62
  }
};