
// B"H

/**
 * @file HumanIKSolver.js
 * @description
 * ============================================================================
 * CHAPTER: THE BENT LIMB THAT FOUND ITS TARGET
 * ============================================================================
 *
 * A knee and elbow are not noodles. They bend with direction, length, and
 * purpose. This two-bone solver places the middle joint between root and
 * target, preserving readable anatomy for walking, bikes, reaching, and waves.
 *
 * @module HumanIKSolver
 */

/**
 * @class HumanIKSolver
 * @description
 * Tiny 2D two-bone inverse kinematics helper.
 */
export class HumanIKSolver {
  /**
   * Solves a two-bone chain.
   *
   * @param {Object} root - Root point.
   * @param {Object} target - Target point.
   * @param {number} lengthA - First bone length.
   * @param {number} lengthB - Second bone length.
   * @param {number} bend - Bend direction multiplier.
   * @returns {Object} Object containing mid and end points.
   */
  static solve(root, target, lengthA, lengthB, bend = 1) {
    const dx = target.x - root.x;
    const dy = target.y - root.y;
    const distRaw = Math.hypot(dx, dy) || 0.0001;
    const dist = Math.min(distRaw, Math.max(1, lengthA + lengthB - 0.001));
    const ux = dx / distRaw;
    const uy = dy / distRaw;
    const cosA = (lengthA * lengthA + dist * dist - lengthB * lengthB) / (2 * lengthA * dist);
    const clamped = Math.max(-1, Math.min(1, cosA));
    const along = lengthA * clamped;
    const height = Math.sqrt(Math.max(0, lengthA * lengthA - along * along));
    const px = -uy * bend;
    const py = ux * bend;

    return {
      mid: {
        x: root.x + ux * along + px * height,
        y: root.y + uy * along + py * height
      },
      end: {
        x: target.x,
        y: target.y
      }
    };
  }
}
