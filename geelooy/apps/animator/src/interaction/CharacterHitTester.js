
// B"H

/**
 * @file CharacterHitTester.js
 * @description
 * ============================================================================
 * CHAPTER: THE REGION THAT ANSWERED WHEN CALLED
 * ============================================================================
 *
 * Hit testing is judgment with mercy: search the topmost vessels first, honor
 * their bounds, and return the entity whose body truly received the touch.
 *
 * @module CharacterHitTester
 */

/**
 * @class CharacterHitTester
 * @description
 * Tests points against stored character hit regions.
 */
export class CharacterHitTester {
  /**
   * Finds the topmost hit region.
   *
   * @param {Array<Object>} regions - Hit regions.
   * @param {Object} point - Canvas point.
   * @returns {Object|null} Hit region or null.
   */
  static hit(regions, point) {
    if (!Array.isArray(regions) || !point) return null;
    for (const region of regions) {
      if (this.inside(region, point)) return region;
    }
    return null;
  }

  /**
   * Tests one point against one rectangle.
   *
   * @param {Object} region - Region rectangle.
   * @param {Object} point - Point.
   * @returns {boolean} True when inside.
   */
  static inside(region, point) {
    return point.x >= region.x &&
      point.y >= region.y &&
      point.x <= region.x + region.width &&
      point.y <= region.y + region.height;
  }
}
