
// B"H

/**
 * @file HitRegionStore.js
 * @description
 * ============================================================================
 * CHAPTER: THE TOUCHABLE BODY IN THE WORLD OF LIGHT
 * ============================================================================
 *
 * A human cannot be selected if the engine does not remember where the body is.
 * This store receives fresh hit regions every frame, sorts them by depth, and
 * places them into app state. The Awtsmoos creates every vessel from nothing
 * every instant; this file records the temporary clickable vessels of this
 * rendered instant.
 *
 * @module HitRegionStore
 */

/**
 * @class HitRegionStore
 * @description
 * Frame-local registry for selectable screen-space regions.
 */
export class HitRegionStore {
  /**
   * Opens a new frame of hit regions.
   *
   * @param {Object} state - App state object with optional set method.
   * @returns {Array<Object>} Empty mutable region list.
   */
  static begin(state) {
    const regions = [];
    if (state && typeof state.set === 'function') {
      state.set('hit_regions', regions);
    }
    return regions;
  }

  /**
   * Adds one selectable region to the current frame.
   *
   * @param {Array<Object>} regions - Active hit-region list.
   * @param {Object} region - Region data.
   * @returns {Object|null} Normalized region or null when invalid.
   */
  static add(regions, region) {
    if (!Array.isArray(regions) || !region || !region.id) return null;

    const normalized = {
      id: String(region.id),
      entityType: region.entityType || 'entity',
      part: region.part || 'body',
      x: Number(region.x) || 0,
      y: Number(region.y) || 0,
      width: Math.max(1, Number(region.width) || 1),
      height: Math.max(1, Number(region.height) || 1),
      depth: Number(region.depth) || 0,
      payload: region.payload || {}
    };

    regions.push(normalized);
    return normalized;
  }

  /**
   * Sorts regions topmost first and writes them into state.
   *
   * @param {Object} state - App state.
   * @param {Array<Object>} regions - Region list.
   * @returns {Array<Object>} Sorted regions.
   */
  static finish(state, regions) {
    const sorted = Array.isArray(regions) ? regions.sort((a, b) => b.depth - a.depth) : [];
    if (state && typeof state.set === 'function') {
      state.set('hit_regions', sorted);
    }
    return sorted;
  }
}
