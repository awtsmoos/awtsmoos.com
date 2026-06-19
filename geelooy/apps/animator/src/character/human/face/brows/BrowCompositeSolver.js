
// B"H
import { BrowPose } from './BrowPose.js';
import { BROW_EXPRESSION_REGISTRY } from './BrowExpressionRegistry.js';
import { BrowSpeechMapper } from './BrowSpeechMapper.js';
import { BrowMicroMotionSolver } from './BrowMicroMotionSolver.js';

/**
 * @file BrowCompositeSolver.js
 * @description
 * ============================================================================
 * CHAPTER: THE BROW COURT WHERE MOOD, SPEECH, AND THOUGHT MERGED
 * ============================================================================
 *
 * The brow subsystem combines emotion, speech, question emphasis, exclamation
 * compression, and micro-motion into one pose. It is its own kingdom, not an
 * afterthought inside a generic face number.
 *
 * @module BrowCompositeSolver
 */

/**
 * @class BrowCompositeSolver
 * @description
 * Solves full brow pose.
 */
export class BrowCompositeSolver {
  /**
   * Samples complete brow pose.
   *
   * @param {Object} character - Character data.
   * @param {number} time - Render time.
   * @returns {Object} Brow pose.
   */
  static sample(character = {}, time = 0) {
    const emotion = character.emotion || character.currentPerformance?.emotion || 'calm';
    const base = BROW_EXPRESSION_REGISTRY[emotion] || BROW_EXPRESSION_REGISTRY.calm;
    const speechText = character.dialogue || character.speech || '';
    const speaking = Boolean(character.speaking || character.currentPerformance?.speech === 'talk' || speechText);
    let pose = BrowPose.blend(BrowPose.neutral(), base, 1);

    if (speaking) {
      pose = BrowPose.blend(pose, BrowSpeechMapper.sample(speechText, time), 0.85);
    }

    pose = BrowPose.blend(pose, BrowMicroMotionSolver.sample(time, character.id || 'human'), 1);
    return pose;
  }
}
