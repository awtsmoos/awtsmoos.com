
// B"H

/**
 * @file NLEStore.js
 * @description
 * ============================================================================
 * CHAPTER: THE TIMELINE WHERE MOMENTS ACCEPTED ORDER
 * ============================================================================
 *
 * Time is a creation, refreshed from nothing every instant. The editor needs
 * a small vessel for created time: tracks, clips, playhead, zoom, selected
 * entities, and keyframes. This store is that vessel.
 *
 * @module NLEStore
 */

/**
 * @class NLEStore
 * @description
 * Data-first NLE state container.
 */
export class NLEStore {
  /**
   * Creates a store.
   *
   * @param {Object} initial - Initial data.
   */
  constructor(initial = {}) {
    this.state = {
      playhead: 0,
      duration: 12000,
      zoom: 1,
      snap: 100,
      selectedClipId: null,
      selectedEntityId: null,
      tracks: [],
      clips: [],
      keyframes: [],
      mode: this.defaultMode(),
      ...initial
    };
    this.listeners = new Set();
  }

  /**
   * Resolves default editor mode for the current vessel.
   *
   * @returns {string} Initial NLE mode.
   */
  defaultMode() {
    const narrow = typeof window !== 'undefined' && window.innerWidth <= 780;
    return narrow ? 'collapsed' : 'compact';
  }

  /**
   * Resolves default editor mode for the current vessel.
   *
   * @returns {string} Initial NLE mode.
   */
  defaultMode() {
    const narrow = typeof window !== 'undefined' && window.innerWidth <= 780;
    return narrow ? 'collapsed' : 'compact';
  }

  /**
   * Gets current state.
   *
   * @returns {Object} State snapshot.
   */
  get() {
    return this.state;
  }

  /**
   * Updates state.
   *
   * @param {Object|Function} patch - Patch object or updater.
   * @returns {Object} Updated state.
   */
  set(patch) {
    const next = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = { ...this.state, ...next };
    this.emit();
    return this.state;
  }

  /**
   * Subscribes to changes.
   *
   * @param {Function} fn - Listener.
   * @returns {Function} Cleanup function.
   */
  subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  /**
   * Emits current state.
   *
   * @returns {void}
   */
  emit() {
    for (const fn of this.listeners) fn(this.state);
  }

  /**
   * Creates default tracks for a full animation editor.
   *
   * @returns {Array<Object>} Tracks.
   */
  static defaultTracks() {
    return [
      { id: 'track_camera', name: 'Camera', type: 'camera', locked: false, muted: false },
      { id: 'track_dialogue', name: 'Dialogue', type: 'dialogue', locked: false, muted: false },
      { id: 'track_action', name: 'Character Action', type: 'action', locked: false, muted: false },
      { id: 'track_emotion', name: 'Emotion', type: 'emotion', locked: false, muted: false },
      { id: 'track_gesture', name: 'Gestures', type: 'gesture', locked: false, muted: false },
      { id: 'track_props', name: 'Props', type: 'prop', locked: false, muted: false },
      { id: 'track_effects', name: 'Effects', type: 'effect', locked: false, muted: false }
    ];
  }
}
