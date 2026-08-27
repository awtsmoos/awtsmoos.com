
// B"H
import { MOTION_PROFILE_REGISTRY } from './data/MotionProfileRegistry.js';

/**
 * @file HumanPerformanceInterpreter.js
 * @description
 * ============================================================================
 * CHAPTER: THE DATA THAT BECAME ACTING
 * ============================================================================
 *
 * A character says: walk, talk, wave, smile, look. This interpreter translates
 * that simple human instruction into the legacy fields the active renderer can
 * understand right now, while preserving the richer future schema.
 *
 * @module HumanPerformanceInterpreter
 */

/**
 * @class HumanPerformanceInterpreter
 * @description
 * Converts high-level human performance data into renderable character fields.
 */
export class HumanPerformanceInterpreter {
  /**
   * Applies performance data onto a character object.
   *
   * @param {Object} character - Character data.
   * @returns {Object} Character enriched for active renderers.
   */
  static apply(character = {}) {
    const perf = character.currentPerformance || {};
    const motion = MOTION_PROFILE_REGISTRY[character.motionProfile] || MOTION_PROFILE_REGISTRY.calm;

    return {
      ...character,
      action: perf.locomotion || character.action || 'idle',
      gesture: perf.gesture || character.gesture || 'none',
      emotion: perf.emotion || character.emotion || 'calm',
      gaze: perf.gaze || character.gaze || 'toward_camera',
      speaking: perf.speech === 'talk' || character.speaking,
      motionProfileData: motion,
      strideMultiplier: motion.stride,
      liftMultiplier: motion.lift,
      gestureMultiplier: motion.gesture,
      speechMultiplier: motion.speech,
      breathMultiplier: motion.breath
    };
  }
}
