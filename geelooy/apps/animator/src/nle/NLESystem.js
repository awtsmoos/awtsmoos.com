
// B"H
import { NLEStore } from './core/NLEStore.js';
import { NLEMount } from './ui/NLEMount.js';

/**
 * @file NLESystem.js
 * @description
 * ============================================================================
 * CHAPTER: THE EDITOR THAT STOPPED BEING A DECORATION
 * ============================================================================
 *
 * This system gives the stage a true non-linear editor: tracks, clips, entity
 * selection, inspector data, and commands. It begins small but complete.
 *
 * @module NLESystem
 */

/**
 * @class NLESystem
 * @description
 * Boot entry for the NLE editor.
 */
export class NLESystem {
  /**
   * Installs the NLE into the app.
   *
   * @param {Object} app - App object.
   * @returns {Object} Installed NLE API.
   */
  static install(app) {
    const store = new NLEStore({
      tracks: NLEStore.defaultTracks(),
      clips: [
        {
          id: 'clip_opening_camera',
          trackId: 'track_camera',
          entityId: null,
          start: 0,
          duration: 2400,
          type: 'camera',
          name: 'Opening Group',
          payload: { shot: 'group', transition: 'fade' }
        },
        {
          id: 'clip_opening_action',
          trackId: 'track_action',
          entityId: 'c1_walker',
          start: 0,
          duration: 2600,
          type: 'action',
          name: 'Walk + Talk',
          payload: { action: 'walk', speech: true }
        }
      ]
    });

    const cleanup = NLEMount.bind(store, app);
    if (app && app.state && app.state.set) app.state.set('nle_store', store);

    return { store, cleanup };
  }
}
