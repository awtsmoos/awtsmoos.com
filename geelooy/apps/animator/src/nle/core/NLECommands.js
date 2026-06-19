
// B"H

/**
 * @file NLECommands.js
 * @description
 * ============================================================================
 * CHAPTER: THE COMMANDS THAT CUT TIME WITHOUT WOUNDING IT
 * ============================================================================
 *
 * Every edit should be a clear decree: add, move, trim, split, delete, select,
 * scrub. Commands are data-first so undo and redo can rise later without
 * mystery.
 *
 * @module NLECommands
 */

/**
 * @class NLECommands
 * @description
 * Mutations for the NLE store.
 */
export class NLECommands {
  /**
   * Adds a clip.
   *
   * @param {NLEStore} store - NLE store.
   * @param {Object} clip - Clip data.
   * @returns {Object} Created clip.
   */
  static addClip(store, clip) {
    const full = {
      id: clip.id || 'clip_' + Date.now() + '_' + Math.floor(Math.random() * 9999),
      trackId: clip.trackId,
      entityId: clip.entityId || null,
      start: Number(clip.start) || 0,
      duration: Math.max(100, Number(clip.duration) || 1000),
      type: clip.type || 'action',
      name: clip.name || clip.type || 'Clip',
      payload: clip.payload || {}
    };
    store.set(s => ({ clips: [...s.clips, full] }));
    return full;
  }

  /**
   * Moves a clip.
   *
   * @param {NLEStore} store - NLE store.
   * @param {string} id - Clip id.
   * @param {number} start - New start.
   * @returns {void}
   */
  static moveClip(store, id, start) {
    store.set(s => ({
      clips: s.clips.map(c => c.id === id ? { ...c, start: Math.max(0, Number(start) || 0) } : c)
    }));
  }

  /**
   * Trims a clip duration.
   *
   * @param {NLEStore} store - NLE store.
   * @param {string} id - Clip id.
   * @param {number} duration - New duration.
   * @returns {void}
   */
  static trimClip(store, id, duration) {
    store.set(s => ({
      clips: s.clips.map(c => c.id === id ? { ...c, duration: Math.max(100, Number(duration) || 100) } : c)
    }));
  }

  /**
   * Deletes a clip.
   *
   * @param {NLEStore} store - NLE store.
   * @param {string} id - Clip id.
   * @returns {void}
   */
  static deleteClip(store, id) {
    store.set(s => ({
      clips: s.clips.filter(c => c.id !== id),
      selectedClipId: s.selectedClipId === id ? null : s.selectedClipId
    }));
  }

  /**
   * Sets playhead.
   *
   * @param {NLEStore} store - NLE store.
   * @param {number} ms - Time in milliseconds.
   * @returns {void}
   */
  static scrub(store, ms) {
    store.set(s => ({ playhead: Math.max(0, Math.min(s.duration, Number(ms) || 0)) }));
  }

  /**
   * Selects a clip.
   *
   * @param {NLEStore} store - NLE store.
   * @param {string|null} id - Clip id.
   * @returns {void}
   */
  static selectClip(store, id) {
    store.set({ selectedClipId: id });
  }

  /**
   * Selects an entity.
   *
   * @param {NLEStore} store - NLE store.
   * @param {string|null} id - Entity id.
   * @returns {void}
   */
  static selectEntity(store, id) {
    store.set({ selectedEntityId: id });
  }
}
