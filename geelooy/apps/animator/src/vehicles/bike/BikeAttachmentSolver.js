
// B"H

/**
 * @file BikeAttachmentSolver.js
 * @description
 * ============================================================================
 * CHAPTER: THE RIDER WHO LOCKED HANDS, FEET, AND PELVIS TO THE MACHINE
 * ============================================================================
 *
 * A bike rider becomes believable when pelvis rests on seat, hands hold the
 * handlebar, and feet follow pedals. This solver exposes those attachment
 * points for human IK and future NLE editing.
 *
 * @module BikeAttachmentSolver
 */

/**
 * @class BikeAttachmentSolver
 * @description
 * Computes rider attachment targets from bike skeleton.
 */
export class BikeAttachmentSolver {
  /**
   * Builds attachment points.
   *
   * @param {Object} skeleton - Bike skeleton.
   * @returns {Object} Attachment map.
   */
  static attachments(skeleton = {}) {
    return {
      pelvis: skeleton.seat,
      leftHand: {
        x: skeleton.handlebar.x - 8 * skeleton.scale,
        y: skeleton.handlebar.y + 3 * skeleton.scale
      },
      rightHand: {
        x: skeleton.handlebar.x + 8 * skeleton.scale,
        y: skeleton.handlebar.y + 3 * skeleton.scale
      },
      leftFoot: skeleton.leftPedal,
      rightFoot: skeleton.rightPedal
    };
  }
}
