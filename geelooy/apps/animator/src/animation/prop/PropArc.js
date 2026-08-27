// B"H

/**
 * @file PropArc.js
 * @description
 * ============================================================================
 * CHAPTER: THE OBJECT THAT STOPPED TELEPORTING
 * ============================================================================
 *
 * A thrown object needs an arc, spin, and release. This module computes the
 * visible flight path.
 *
 * @class PropArc
 */
export class PropArc {
  /**
   * Samples a parabolic throw.
   *
   * @param {Object} event - Prop event.
   * @param {number} t - Progress.
   * @returns {Object} Position and rotation.
   */
  static sample(event, t) {
    const p0 = event.from || { x: 0, y: 0 };
    const p2 = event.to || p0;
    const h = Number.isFinite(event.height) ? event.height : 130;
    const p1 = {
      x: (p0.x + p2.x) / 2,
      y: Math.min(p0.y, p2.y) - h
    };

    const inv = 1 - t;
    return {
      x: inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x,
      y: inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y,
      rotation: t * 720,
      visible: true
    };
  }
}