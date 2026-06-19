
// B"H

/**
 * @file NeckAnchorMetrics.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SPAN OF THE NECK WAS MEASURED AND JUDGED
 * ═══════════════════════════════════════════════════════════════
 *
 * The giant tan pillar happened because old assemblers sent a neck from torso
 * space to skull space. This module gives one tiny bridge under the head.
 * The head may stay high. The torso may stay low. The neck is never the body.
 *
 * The Awtsmoos creates the infinite and the finite. The finite neck accepts
 * its exact limit.
 *
 * @class NeckAnchorMetrics
 */
export class NeckAnchorMetrics {
  /**
   * Builds safe neck endpoints from a head center.
   *
   * @param {Object} args - Metric arguments.
   * @param {Object} args.head - Head anatomy data.
   * @param {number} args.headX - Head center x.
   * @param {number} args.headY - Head center y.
   * @param {Object} args.profile - Perspective profile.
   * @param {Object} args.data - Character data.
   * @returns {Object} Safe neck anchors.
   */
  static fromHead(args = {}) {
    const head = args.head || {};
    const profile = args.profile || {};
    const headX = this.num(args.headX, this.num(head.cx, 0)) + this.num(profile.headOffset, 0);
    const headY = this.num(args.headY, this.num(head.cy, -340));
    const headRY = this.num(head.rY, 90);
    const height = this.height(args.data);

    const endY = headY + headRY * 0.66;
    const startY = endY + height;

    return {
      startX: headX,
      startY,
      endX: headX,
      endY,
      widthTop: this.widthTop(args.data),
      widthBottom: this.widthBottom(args.data),
      maxHeight: height + 2
    };
  }

  /**
   * Returns safe neck height.
   *
   * @param {Object} data - Character data.
   * @returns {number} Height in local pixels.
   */
  static height(data) {
    const override = data?.anatomyOverrides?.neckHeight;
    if (Number.isFinite(override)) return Math.max(14, Math.min(34, override));
    return data?.style === 'illustrated_sage' ? 23 : 25;
  }

  /**
   * Returns top width.
   *
   * @param {Object} data - Character data.
   * @returns {number} Width.
   */
  static widthTop(data) {
    const override = data?.anatomyOverrides?.neckWidthTop;
    if (Number.isFinite(override)) return Math.max(12, Math.min(32, override));
    return 20;
  }

  /**
   * Returns bottom width.
   *
   * @param {Object} data - Character data.
   * @returns {number} Width.
   */
  static widthBottom(data) {
    const override = data?.anatomyOverrides?.neckWidthBottom;
    if (Number.isFinite(override)) return Math.max(14, Math.min(38, override));
    return data?.style === 'illustrated_sage' ? 30 : 27;
  }

  /**
   * Returns finite number or fallback.
   *
   * @param {*} value - Candidate number.
   * @param {number} fallback - Fallback number.
   * @returns {number} Safe number.
   */
  static num(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }
}
