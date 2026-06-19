
// B"H

/**
 * @file SubjectBoundsSolver.js
 * @description
 * ============================================================================
 * CHAPTER: THE CAMERA THAT FIRST ASKED WHERE THE PEOPLE ARE
 * ============================================================================
 *
 * A camera without subject bounds is a king without witnesses. This solver
 * measures selected characters, focused ids, or all visible hit regions so
 * shots can frame real bodies instead of guessing.
 *
 * @module SubjectBoundsSolver
 */

/**
 * @class SubjectBoundsSolver
 * @description
 * Computes subject bounds from app state.
 */
export class SubjectBoundsSolver {
  /**
   * Computes bounds for camera focus.
   *
   * @param {Object} state - App state.
   * @param {Object} event - Camera event or intent.
   * @returns {Object|null} Bounds or null.
   */
  static solve(state, event = {}) {
    const regions = state && state.get ? state.get('hit_regions') || [] : [];
    const focus = event.focus ? (Array.isArray(event.focus) ? event.focus : [event.focus]) : null;
    const selected = state && state.get ? state.get('selected_entity_id') : null;
    const wanted = focus || (selected ? [selected] : null);
    const usable = wanted ? regions.filter(r => wanted.includes(r.id)) : regions.filter(r => r.entityType === 'character');

    if (!usable.length) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const r of usable) {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    }

    return {
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
      centerX: (minX + maxX) * 0.5,
      centerY: (minY + maxY) * 0.5
    };
  }
}
