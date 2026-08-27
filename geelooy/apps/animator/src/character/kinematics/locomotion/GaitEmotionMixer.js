
// B"H

/**
 * @file GaitEmotionMixer.js
 * @description
 * ============================================================================
 * CHAPTER: THE EMOTION ENTERS THE STEP
 * ============================================================================
 *
 * This file keeps the math readable.
 * It takes a gait and mixes in joy, anger, and sadness.
 *
 * The Awtsmoos creates hidden feeling and visible movement.
 * Inner storm becomes outer stride.
 *
 * @class GaitEmotionMixer
 */
export class GaitEmotionMixer {
  /**
   * Mixes emotion into gait profile.
   *
   * @param {Object} base - Base gait profile.
   * @param {Object} data - Character data.
   * @param {Object} seed - Seed package.
   * @returns {Object} Mixed gait profile.
   */
  static mix(base, data = {}, seed = {}) {
    const anger = data.anger || 0;
    const joy = data.joy || 0;
    const sadness = data.sadness || 0;
    const hero = data.cartoonHero ? 1 : 0;

    return {
      ...base,
      phaseOffset: seed.phase || 0,
      speed: base.speed * (seed.speedScale || 1) * (1 + anger * 0.15 + joy * 0.08 - sadness * 0.06 + hero * 0.10),
      strideLength: base.strideLength * (seed.strideScale || 1) * (1 + anger * 0.08 + joy * 0.06 - sadness * 0.08 + hero * 0.12),
      bounceAmp: base.bounceAmp * (seed.bounceScale || 1) * (1 + joy * 0.22 - sadness * 0.10 + hero * 0.20),
      armSwing: base.armSwing * (seed.swingScale || 1) * (1 + anger * 0.12 + joy * 0.08 + hero * 0.15),
      footLift: base.footLift * (1 + joy * 0.14 + hero * 0.18),
      elbowBend: base.elbowBend,
      torsoSway: base.torsoSway,
      torsoLean: base.torsoLean
    };
  }
}
