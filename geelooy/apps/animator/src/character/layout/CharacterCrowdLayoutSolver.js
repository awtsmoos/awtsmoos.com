
// B"H

/**
 * @file CharacterCrowdLayoutSolver.js
 * @description
 * Disabled compatibility class. It must not change character positions.
 */

/**
 * @class CharacterCrowdLayoutSolver
 * @description
 * No-op.
 */
export class CharacterCrowdLayoutSolver {
  /**
   * Returns entries unchanged.
   *
   * @param {Array<Array<string,Object>>} entries - Character entries.
   * @returns {Array<Array<string,Object>>} Same entries.
   */
  static apply(entries = []) {
    return entries;
  }
}
