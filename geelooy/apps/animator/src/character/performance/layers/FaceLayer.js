
// B"H
import { BrowSystem } from '../../human/face/brows/BrowSystem.js';

/**
 * @file FaceLayer.js
 * @description Face performance layer with full brow channels.
 */

export class FaceLayer {
  /**
   * Applies face data.
   *
   * @param {Object} pose - Pose.
   * @param {Object} state - State.
   * @param {Object} view - View.
   * @param {number} time - Time.
   * @param {Object} world - World.
   * @returns {Object} Pose.
   */
  static apply(pose, state, view, time, world = {}) {
    const character = state.raw || state.data || state || {};
    const index = Number(world.index || character.index || 0);
    const brows = BrowSystem.sample(character, time, index);
    const speaking = Boolean(character.speaking || state.speech === 'talk' || character.dialogue);
    const beat = speaking ? Math.abs(Math.sin(time * 0.0105)) : 0;
    const emotion = state.emotion || character.emotion || character.currentPerformance?.emotion || 'calm';

    pose.face = {
      ...(pose.face || {}),
      eyeOpen: this.eyeOpen(time, index),
      pupilX: Math.sin(time * 0.0017 + index) * 0.08,
      pupilY: Math.cos(time * 0.0013 + index) * 0.05,
      mouthOpen: speaking ? 0.1 + beat * 0.72 : emotion === 'surprised' ? 0.5 : 0.04,
      mouthWide: emotion === 'happy' ? 0.24 : 0,
      mouthSmile: emotion === 'happy' ? 0.55 : 0.04,
      cheekLift: emotion === 'happy' ? 0.35 : speaking ? beat * 0.16 : 0.03,
      brows,
      browInner: (brows.left.innerLift + brows.right.innerLift) * 0.5,
      browOuter: (brows.left.outerLift + brows.right.outerLift) * 0.5,
      browPinch: brows.center.pinch,
      browCompression: brows.center.compression,
      browAsymmetry: brows.global.asymmetry,
      browWrinkle: brows.center.wrinkleIntensity
    };

    return pose;
  }

  /**
   * Computes blink.
   *
   * @param {number} time - Time.
   * @param {number} index - Index.
   * @returns {number} Eye openness.
   */
  static eyeOpen(time, index) {
    const phase = ((time + index * 377) % 4300) / 4300;
    if (phase > 0.955) return 0.05;
    if (phase > 0.925) return 0.35;
    return 1;
  }

  /**
   * Runner-compatible sample.
   *
   * @param {Object} args - Args.
   * @returns {Object} Pose.
   */
  static sample(args = {}) {
    return this.apply(args.pose || {}, args.state || {}, args.view || {}, args.time || 0, args.world || {});
  }
}
