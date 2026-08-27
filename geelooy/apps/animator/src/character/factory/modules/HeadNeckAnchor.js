
// B"H

/**
 * @file HeadNeckAnchor.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SMALL BRIDGE UNDER THE SKULL
 * ═══════════════════════════════════════════════════════════════
 *
 * This module exists because two assemblers separately invented neck endpoints
 * and both created impossible vertical spans. A single anchor contract now
 * defines where the head is and where the tiny neck belongs.
 *
 * The Awtsmoos creates every creature through precise letters. Here the
 * letters become numbers: head center, neck top, neck bottom, width.
 *
 * @class HeadNeckAnchor
 */
export class HeadNeckAnchor {
  /**
   * Computes bounded head and neck coordinates.
   *
   * @param {Object} args - Anchor arguments.
   * @param {Object} args.head - Head anatomy data.
   * @param {Object} args.profile - Perspective profile.
   * @param {number} args.headY - Head center y.
   * @param {number} args.headX - Head center x.
   * @param {Object} args.data - Character data.
   * @returns {Object} Head and neck anchors.
   */
  static compute(args = {}) {
    const head = args.head || {};
    const data = args.data || {};
    const profile = args.profile || {};

    const rY = this.finite(head.rY, 90);
    const headX = this.finite(args.headX, this.finite(head.cx, 0)) + this.finite(profile.headOffset, 0);
    const headY = this.finite(args.headY, this.finite(head.cy, -330));

    const neckHeight = this.neckHeight(data);
    const topY = headY + rY * 0.66;
    const bottomY = topY + neckHeight;

    return {
      headX,
      headY,
      neckTopX: headX,
      neckTopY: topY,
      neckBottomX: headX,
      neckBottomY: bottomY,
      neckHeight,
      widthTop: this.widthTop(data),
      widthBottom: this.widthBottom(data)
    };
  }

  /**
   * Gets safe neck height.
   *
   * @param {Object} data - Character data.
   * @returns {number} Height.
   */
  static neckHeight(data) {
    const override = data?.anatomyOverrides?.neckHeight;
    if (Number.isFinite(override)) return Math.max(12, Math.min(34, override));
    return data?.style === 'illustrated_sage' ? 22 : 24;
  }

  /**
   * Gets top neck width.
   *
   * @param {Object} data - Character data.
   * @returns {number} Width.
   */
  static widthTop(data) {
    const override = data?.anatomyOverrides?.neckWidthTop;
    if (Number.isFinite(override)) return Math.max(10, Math.min(30, override));
    return data?.style === 'illustrated_sage' ? 22 : 20;
  }

  /**
   * Gets bottom neck width.
   *
   * @param {Object} data - Character data.
   * @returns {number} Width.
   */
  static widthBottom(data) {
    const override = data?.anatomyOverrides?.neckWidthBottom;
    if (Number.isFinite(override)) return Math.max(12, Math.min(36, override));
    return data?.style === 'illustrated_sage' ? 30 : 26;
  }

  /**
   * Returns finite number or fallback.
   *
   * @param {*} value - Candidate.
   * @param {number} fallback - Fallback.
   * @returns {number} Safe number.
   */
  static finite(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }
}
