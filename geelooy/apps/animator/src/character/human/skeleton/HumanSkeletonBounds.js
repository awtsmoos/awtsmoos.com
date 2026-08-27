
// B"H

/**
 * @file HumanSkeletonBounds.js
 * @description
 * ============================================================================
 * CHAPTER: THE BOUNDARY THAT PROVED THE BODY WAS PRESENT
 * ============================================================================
 *
 * Camera framing, selection, and debug overlays all need the human's real
 * visible extent. This file measures the skeleton itself: head, hands, hips,
 * knees, feet, and every joint that tells where the person stands.
 *
 * @module HumanSkeletonBounds
 */

/**
 * @class HumanSkeletonBounds
 * @description
 * Computes bounding boxes from human skeletons.
 */
export class HumanSkeletonBounds {
  /**
   * Computes bounds from all numeric joints.
   *
   * @param {Object} skeleton - Human skeleton.
   * @param {Object} character - Character data.
   * @returns {Object} Bounding rectangle.
   */
  static fromSkeleton(skeleton = {}, character = {}) {
    const points = Object.values(skeleton).filter(p =>
      p && typeof p === 'object' && Number.isFinite(p.x) && Number.isFinite(p.y)
    );

    if (!points.length) {
      const pos = character.position || {};
      return { x: Number(pos.x) - 70, y: Number(pos.y) - 240, width: 140, height: 280 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }

    const pad = 34 * (Number(character.scale) || 1);
    return {
      x: minX - pad,
      y: minY - pad,
      width: Math.max(1, maxX - minX + pad * 2),
      height: Math.max(1, maxY - minY + pad * 2),
      minX,
      minY,
      maxX,
      maxY
    };
  }
}
