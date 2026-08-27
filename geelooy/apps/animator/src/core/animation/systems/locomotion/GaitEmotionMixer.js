
// B"H

/**
 * @file GaitEmotionMixer.js
 * @description
 * ============================================================================
 * CHAPTER: INNER FEELING BECOMES OUTER STEP
 * ============================================================================
 *
 * The walk now also consumes animPersonality, making each character walk with
 * distinct rhythm and energy even if they share the same base action.
 */
export class GaitEmotionMixer {
  /**
   * Mixes emotion and personality into a gait profile.
   *
   * @param {Object} base - Base gait.
   * @param {Object} data - Character data.
   * @param {Object} seed - Seed package.
   * @returns {Object} Mixed gait.
   */
  static mix(base, data = {}, seed = {}) {
    const anger = data.anger || 0;
    const joy = data.joy || 0;
    const sadness = data.sadness || 0;
    const hero = data.cartoonHero ? 1 : 0;
    const soul = data.animPersonality || {};

    return {
      ...base,
      phaseOffset: seed.phase || 0,
      speed: base.speed * (seed.speedScale || 1) * (soul.speedScale || 1) * (1 + anger * 0.15 + joy * 0.08 - sadness * 0.06 + hero * 0.10),
      strideLength: base.strideLength * (seed.strideScale || 1) * (1 + anger * 0.08 + joy * 0.06 - sadness * 0.08 + hero * 0.12),
      bounceAmp: base.bounceAmp * (seed.bounceScale || 1) * (soul.bounceScale || 1) * (1 + joy * 0.22 - sadness * 0.10 + hero * 0.20),
      armSwing: base.armSwing * (seed.swingScale || 1) * (1 + anger * 0.12 + joy * 0.08 + hero * 0.15),
      footLift: base.footLift * (1 + joy * 0.14 + hero * 0.18),
      elbowBend: base.elbowBend,
      torsoSway: base.torsoSway * (0.8 + (soul.bounceScale || 1) * 0.2),
      torsoLean: base.torsoLean + ((soul.posture || 0) * 3)
    };
  }
}
