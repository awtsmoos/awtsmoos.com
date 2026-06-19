
// B"H

/**
 * @file SoulVerticalMetrics.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SPINE THAT STOPPED SCREAMING
 * ═══════════════════════════════════════════════════════════════
 *
 * The old assembly placed the head at the raw anatomy cy and the torso at the
 * leg pivot. Those numbers are valid only if every renderer agrees what the
 * origin means. On mobile, the visible origin became a blade: head above the
 * strip, hands below the torso, legs still visible, and the body apparently
 * stretched beyond the frame.
 *
 * This module gives the realistic assembler one explicit vertical map. Every
 * major part receives a named station instead of inventing its own height.
 *
 * The Awtsmoos creates the ladder from above to below, and every rung knows
 * where it stands.
 *
 * @class SoulVerticalMetrics
 */
export class SoulVerticalMetrics {
  /**
   * Builds stable vertical stations for a humanoid body.
   *
   * @param {Object} anatomy - The ANATOMY data object.
   * @param {Object} coreState - Core kinematic offsets.
   * @returns {Object} Named vertical station map.
   */
  static from(anatomy, coreState) {
    const headCy = this.safeNumber(anatomy.head?.cy, -330);
    const legPivotY = this.safeNumber(anatomy.legs?.pivotY, -145);
    const bodyHeight = this.safeNumber(anatomy.body?.h, 180);
    const headYOffset = this.safeNumber(coreState.headYOffset, 0);

    return {
      groundAnchorY: 0,
      legLayerY: 0,
      upperBodyY: 0,
      torsoY: legPivotY,
      shoulderY: legPivotY - bodyHeight * 0.82,
      neckStartY: legPivotY - bodyHeight * 0.92,
      headY: headCy + headYOffset,
      visualTopY: headCy - this.safeNumber(anatomy.head?.rY, 95),
      visualBottomY: 70
    };
  }

  /**
   * Returns a finite number or fallback.
   *
   * @param {*} value - Candidate number.
   * @param {number} fallback - Fallback number.
   * @returns {number} Safe value.
   */
  static safeNumber(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }
}
