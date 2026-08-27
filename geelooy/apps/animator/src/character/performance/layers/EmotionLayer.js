// B"ה
import { PerformanceLayerMixer as Mix } from '../core/PerformanceLayerMixer.js';

/**
 * @file EmotionLayer.js
 * @description
 * Facial emotion as brows, cheeks, eyelids, and mouth—not just one smile.
 */
export class EmotionLayer {
  /**
   * Applies emotion.
   *
   * @param {Object} pose - Pose.
   * @param {Object} state - State.
   * @param {Object} view - View.
   * @param {number} time - Time.
   * @returns {void}
   */
  static apply(pose, state, view, time) {
    const e = state.emotion || 'neutral';
    const map = {
      happy: { smile: 0.75, cheek: 1.2, browLift: 0.1 },
      excited: { smile: 0.85, cheek: 1.6, browLift: 0.45, mouthOpen: 0.28 },
      focused: { smile: 0.12, browPinch: 0.28, browLift: 0.1 },
      attentive: { smile: 0.18, browLift: 0.22 },
      ready: { smile: 0.2, browLift: 0.3, browPinch: 0.12 },
      worried: { smile: -0.2, browLift: 0.55, browPinch: 0.45 },
      surprised: { mouthOpen: 0.58, browLift: 0.8, cheek: 0.1 },
      calm: { smile: 0.25, browLift: 0.05 },
      neutral: { smile: 0.05 }
    };

    Mix.face(pose, map[e] || map.neutral, 0.62);
  }
}