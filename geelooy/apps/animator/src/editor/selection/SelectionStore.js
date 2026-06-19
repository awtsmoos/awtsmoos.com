// B"H

/**
 * @file SelectionStore.js
 * @description
 * Editor selection model for actors, props, cameras, and timeline clips.
 */
export class SelectionStore {
  /**
   * Creates store.
   */
  constructor() {
    this.selectedKind = 'none';
    this.selectedId = null;
    this.hoveredId = null;
  }

  /**
   * Selects item.
   *
   * @param {string} kind - Kind.
   * @param {string} id - Id.
   * @returns {void}
   */
  select(kind, id) {
    this.selectedKind = kind || 'none';
    this.selectedId = id || null;
  }

  /**
   * Clears selection.
   *
   * @returns {void}
   */
  clear() {
    this.select('none', null);
  }

  /**
   * Serializes.
   *
   * @returns {Object} Data.
   */
  toJSON() {
    return {
      selectedKind: this.selectedKind,
      selectedId: this.selectedId,
      hoveredId: this.hoveredId
    };
  }
}