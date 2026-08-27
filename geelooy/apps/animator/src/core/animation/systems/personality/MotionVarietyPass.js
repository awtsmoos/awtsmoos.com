
// B"H
import { AnimationPersonality } from './AnimationPersonality.js';

/**
 * @file MotionVarietyPass.js
 * @description
 * ============================================================================
 * CHAPTER: EACH CHARACTER GETS A PRIVATE MOTION DNA
 * ============================================================================
 *
 * This pass attaches personality to character data every frame.
 * Other systems can consume it without recomputing.
 */
export class MotionVarietyPass {
  /**
   * Applies animation personality to the character.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Same data.
   */
  static apply(data) {
    if (!data) return data;

    const personality = AnimationPersonality.resolve(data);
    data.animPersonality = personality;

    if (!Number.isFinite(data.playbackSpeed)) {
      data.playbackSpeed = personality.speedScale;
    }

    if (!data.easyMotion && data.motionMood) {
      data.easyMotion = data.motionMood;
    }

    return data;
  }
}
