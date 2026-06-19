
// B"H
import { HtmlSpecRenderer } from '../../utils/html/HtmlSpecRenderer.js';
import { NLETemplate } from './NLETemplate.js';
import { NLECommands } from '../core/NLECommands.js';
import { NLEModeCycle } from '../core/NLEModes.js';
import { NLEInteractionSeal } from './NLEInteractionSeal.js';

/**
 * @file NLEMount.js
 * @description
 * ============================================================================
 * CHAPTER: THE TIMELINE THAT OBEYED THE SMALL SCREEN
 * ============================================================================
 *
 * The NLE can collapse, compact, and expand. It remains useful without covering
 * the whole living stage on mobile.
 *
 * @module NLEMount
 */

/**
 * @class NLEMount
 * @description
 * Mounts NLE UI.
 */
export class NLEMount {
  /**
   * Ensures mount exists.
   *
   * @returns {Element} Mount element.
   */
  static ensureMount() {
    let mount = document.getElementById('aw-nle-mount');
    if (mount) return mount;

    const host = document.getElementById('nle-timeline')
      || document.getElementById('main-stage')
      || document.body;
    mount = document.createElement('div');
    mount.id = 'aw-nle-mount';
    host.appendChild(mount);
    return mount;
  }

  /**
   * Binds store to UI.
   *
   * @param {Object} store - NLE store.
   * @param {Object} app - App object.
   * @returns {Function} Cleanup.
   */
  static bind(store, app) {
    const mount = NLEInteractionSeal.apply(this.ensureMount());
    const render = state => {
      HtmlSpecRenderer.mount(mount, NLETemplate.shell(state), this.events(store, app, mount));
    };

    const offStore = store.subscribe(render);
    const onSelection = event => {
      NLECommands.selectEntity(store, event.detail && event.detail.id ? event.detail.id : null);
    };

    window.addEventListener('nle-selection-changed', onSelection);

    return () => {
      offStore();
      window.removeEventListener('nle-selection-changed', onSelection);
    };
  }

  /**
   * Creates event handlers.
   *
   * @param {Object} store - NLE store.
   * @param {Object} app - App object.
   * @param {Element} mount - Mount.
   * @returns {Object} Event map.
   */
  static events(store, app, mount) {
    return {
      togglePlay: () => {
        if (app && app.director && app.director.isPlaying && app.director.pause) app.director.pause();
        else if (app && app.director && app.director.resume) app.director.resume();
      },
      cycleMode: () => store.set(s => ({ mode: NLEModeCycle.next(s.mode || 'compact') })),
      addActionClip: () => NLECommands.addClip(store, {
        trackId: 'track_action',
        entityId: store.get().selectedEntityId,
        type: 'action',
        name: 'Walk + Wave + Talk',
        duration: 1600,
        payload: { action: 'walk', gesture: 'wave', speech: true }
      }),
      addDialogueClip: () => NLECommands.addClip(store, {
        trackId: 'track_dialogue',
        entityId: store.get().selectedEntityId,
        type: 'dialogue',
        name: 'Dialogue',
        duration: 2200,
        payload: { text: 'B"H, the scene speaks with life.' }
      }),
      addCameraClip: () => NLECommands.addClip(store, {
        trackId: 'track_camera',
        type: 'camera',
        name: 'Close Up',
        duration: 1400,
        payload: { shot: 'closeUp', transition: 'cut' }
      }),
      selectClip: event => {
        event.stopPropagation();
        NLECommands.selectClip(store, event.currentTarget.dataset.clipId);
      },
      scrubTimeline: event => {
        if (!event.currentTarget.classList.contains('aw-nle-clips')) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        NLECommands.scrub(store, x / Math.max(0.01, 0.06 * (store.get().zoom || 1)));
      }
    };
  }
}
