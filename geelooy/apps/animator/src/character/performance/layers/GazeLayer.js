
// B"H

/**
 * @file GazeLayer.js
 * @description
 * ============================================================================
 * CHAPTER: THE EYES THAT CHOSE WHERE MEANING LIVED
 * ============================================================================
 *
 * Gaze gives life. A body may walk, but eyes declare attention. This layer
 * produces subtle head and pupil offsets from simple targets: camera, forward,
 * up, down, left, right, or another entity later.
 *
 * @module GazeLayer
 */

/**
 * @class GazeLayer
 * @description
 * Samples gaze pose data.
 */
export class GazeLayer {
  /**
   * Samples gaze offsets.
   *
   * @param {Object} character - Character data.
   * @param {number} time - Render time.
   * @returns {Object} Gaze pose.
   */
  static sample(character = {}, time = 0) {
    const gaze = character.gaze || character.currentPerformance?.gaze || 'toward_camera';
    const drift = Math.sin(time * 0.0013) * 0.18;
    const map = {
      toward_camera: { eyeX: 0, eyeY: 0, headTurn: 0 },
      forward: { eyeX: 0.2, eyeY: 0, headTurn: 0.08 },
      up: { eyeX: 0, eyeY: -0.28, headTurn: 0 },
      down: { eyeX: 0, eyeY: 0.28, headTurn: 0 },
      left: { eyeX: -0.42, eyeY: 0, headTurn: -0.18 },
      right: { eyeX: 0.42, eyeY: 0, headTurn: 0.18 }
    };

    const chosen = map[gaze] || map.toward_camera;

    return {
      face: {
        gazeX: chosen.eyeX + drift,
        gazeY: chosen.eyeY + Math.cos(time * 0.0011) * 0.08,
        headTurn: chosen.headTurn
      }
    };
  }
}
