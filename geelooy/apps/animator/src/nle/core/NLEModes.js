
// B"H

/**
 * @file NLEModes.js
 * @description
 * ============================================================================
 * CHAPTER: THE EDITOR THAT LEARNED TO BREATHE ON MOBILE
 * ============================================================================
 *
 * The NLE must not devour the stage. It has three vessels: collapsed for pure
 * viewing, compact for quick editing, and expanded for full timeline work.
 *
 * @module NLEModes
 */

/**
 * @constant NLE_MODES
 * @description
 * Mobile/desktop NLE layout modes.
 */
export const NLE_MODES = {
  collapsed: { height: 58, label: 'Collapsed' },
  compact: { height: 126, label: 'Compact' },
  expanded: { height: 236, label: 'Expanded' }
};

/**
 * @class NLEModeCycle
 * @description
 * Cycles through editor modes.
 */
export class NLEModeCycle {
  /**
   * Returns next mode.
   *
   * @param {string} mode - Current mode.
   * @returns {string} Next mode.
   */
  static next(mode) {
    if (mode === 'collapsed') return 'compact';
    if (mode === 'compact') return 'expanded';
    return 'collapsed';
  }
}
