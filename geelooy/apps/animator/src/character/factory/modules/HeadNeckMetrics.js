
// B"H

/**
 * @file HeadNeckMetrics.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE NECK THAT REFUSED TO BECOME A SKYSCRAPER
 * ═══════════════════════════════════════════════════════════════
 *
 * The screenshots revealed a tall tan pillar rising from the body into the
 * upper sky. Searching the exported file headers showed the exact cause:
 * HeadAssembler and IllustratedSoulAssembler were feeding Neck.build endpoints
 * from torso-space to head-space. Neck.js obeyed and drew the impossible span.
 *
 * This module defines a real bounded neck contract:
 * - head center is high
 * - neck top is just below the skull
 * - neck bottom is only a few pixels below that
 * - torso never becomes neck
 * - pelvis never becomes neck
 *
 * The Awtsmoos creates every measure from nothing every instant. A neck is a
 * measure. It is not the entire ladder from earth to heaven.
 *
 * @class HeadNeckMetrics
 */
export class HeadNeckMetrics {
  /**
   * Resolves complete bounded anchors for head and neck.
   *
   * @param {Object} args - Anchor configuration.
   * @param {Object} args.anatomy - Global ANATOMY data.
   * @param {Object} args.profile - Perspective profile.
   * @param {Object} args.data - Character data.
   * @param {number} args.headY - Local head center y.
   * @param {number} args.headX - Local head center x.
   * @returns {Object} Bounded head and neck anchor object.
   */
  static resolve(args = {}) {
    const anatomy = args.anatomy || {};
    const profile = args.profile || {};
    const data = args.data || {};
    const h = anatomy.head || {};

    const headRadiusY = this.finite(h.rY, 92);
    const headCenterX = this.finite(args.headX, 0) + this.finite(profile.headOffset, 0);
    const headCenterY = this.finite(args.headY, this.finite(h.cy, -340));
    const neckHeight = this.neckHeight(data);
    const neckWidthTop = this.neckWidthTop(data);
    const neckWidthBottom = this.neckWidthBottom(data);

    const skullBottomY = headCenterY + headRadiusY * 0.68;
    const neckTopY = skullBottomY - 2;
    const neckBottomY = neckTopY + neckHeight;

    return {
      headX: headCenterX,
      headY: headCenterY,
      skullBottomY,
      neckTopX: headCenterX,
      neckTopY,
      neckBottomX: headCenterX,
      neckBottomY,
      neckHeight,
      neckWidthTop,
      neckWidthBottom
    };
  }

  /**
   * Returns safe finite number.
   *
   * @param {*} value - Candidate value.
   * @param {number} fallback - Fallback number.
   * @returns {number} Finite number.
   */
  static finite(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  /**
   * Returns bounded biological neck height.
   *
   * @param {Object} data - Character data.
   * @returns {number} Neck height.
   */
  static neckHeight(data) {
    const override = data?.anatomyOverrides?.neckHeight;
    if (Number.isFinite(override)) return Math.max(12, Math.min(36, override));
    if (data?.archetype === 'kid') return 16;
    if (data?.style === 'illustrated_sage') return 24;
    return 26;
  }

  /**
   * Returns top neck width.
   *
   * @param {Object} data - Character data.
   * @returns {number} Width.
   */
  static neckWidthTop(data) {
    const override = data?.anatomyOverrides?.neckWidthTop;
    if (Number.isFinite(override)) return Math.max(12, Math.min(34, override));
    return 22;
  }

  /**
   * Returns bottom neck width.
   *
   * @param {Object} data - Character data.
   * @returns {number} Width.
   */
  static neckWidthBottom(data) {
    const override = data?.anatomyOverrides?.neckWidthBottom;
    if (Number.isFinite(override)) return Math.max(14, Math.min(40, override));
    return 28;
  }
}
