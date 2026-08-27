// B"H
import { CharacterPerformanceComposer } from '../../performance/CharacterPerformanceComposer.js';

/**
 * @file StableWholeBodyPose.js
 * @description
 * Compatibility wrapper used by the existing stable renderer, now powered by
 * layered human performance instead of single-action replacement.
 */
export class StableWholeBodyPose {
  /**
   * Gets whole body pose.
   *
   * @param {Object} data - Character data.
   * @param {Object} view - View profile.
   * @param {number} time - Render time.
   * @returns {Object} Pose.
   */
  static get(data, view, time) {
    return CharacterPerformanceComposer.compose(data, view, time, {
      characters: data._allCharacters || {},
      props: data._allProps || {}
    });
  }
}