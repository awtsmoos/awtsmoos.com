
// B"H

/**
 * @file CompactGroundSchema.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE FEET TOUCH THE EARTH
 * ═══════════════════════════════════════════════════════════════
 *
 * The figures looked like cutouts floating above the sidewalk. This schema
 * gives one visual ground law: local footY is zero, scene position y is the
 * contact point, and shadows live below the feet.
 *
 * The Awtsmoos creates the earth from nothing. The character must accept the
 * earth and stand on it.
 *
 * @class CompactGroundSchema
 */
export class CompactGroundSchema {
  /**
   * Returns compact grounding metrics.
   *
   * @returns {Object} Ground metrics.
   */
  static get() {
    return {
      footY: 0,
      shadowY: 7,
      shadowRX: 42,
      shadowRY: 8,
      speechLift: 300
    };
  }

  /**
   * Resolves character world y from data.
   *
   * @param {Object} data - Character data.
   * @returns {number} World y.
   */
  static y(data) {
    if (Number.isFinite(data.position?.groundY)) return data.position.groundY;
    if (Number.isFinite(data.position?.y)) return data.position.y;
    return 0;
  }
}
