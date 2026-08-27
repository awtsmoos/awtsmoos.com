// B"H
import { SpeechAnchorResolver } from './SpeechAnchorResolver.js';
import { BubbleCollisionAvoider } from './BubbleCollisionAvoider.js';

/**
 * @file BubblePlacementSolver.js
 * @description
 * Places bubbles near the speaker without covering the face.
 */
export class BubblePlacementSolver {
  /**
   * Solves placement.
   *
   * @param {Object} character - Character.
   * @param {number} w - Width.
   * @param {number} h - Height.
   * @returns {Object} Placement.
   */
  static solve(character, w, h) {
    const anchors = SpeechAnchorResolver.resolve(character);
    const rect = {
      x: anchors.preferred.x - w * 0.5,
      y: anchors.preferred.y - h,
      w,
      h
    };

    const safe = BubbleCollisionAvoider.avoid(rect, anchors);
    const tail = {
      x: anchors.mouth.x,
      y: Math.min(anchors.mouth.y - 8 * anchors.scale, safe.y + safe.h + 34 * anchors.scale)
    };

    return {
      rect: safe,
      tail,
      anchors
    };
  }
}