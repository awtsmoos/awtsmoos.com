// B"H
/**
 * @file vibe-view.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE FRACTAL ORCHESTRATOR (Menahel HaFraktal)
 * THE RENDER LOOP PROTECTION RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * THE POEM OF THE INFINITE RENDER:
 * render() called _manifestLogic(), which called render() again,
 * A hall of mirrors stretching to infinite pain!
 * Each RAF fired and stacked another call deep,
 * Until the stack overflowed and the browser fell asleep.
 * Now _isManifesting stands guard at the gate,
 * Only ONE logic-chain may pass — the others must wait!
 * When manifestation completes, the flag is released,
 * And the render loop flows again, in perfect peace!
 *
 * @module VibeView
 */

import { VibeLayout }        from './view/sidebar/layout.js';
import { VibeResizer }       from './view/resizer.js';
import { VibeSidebarTree }   from './view/sidebar/tree.js';
import { ChatHistory }       from './view/chat/history.js';
import { ChatInput }         from './view/chat/input.js';
import { VibeSidebarBinder } from './view/sidebar/binder.js';
import { VibeSidebarPanels } from './view/sidebar/panels.js';
import { VibeStateSync }     from './view/sidebar/state-sync.js';
import { ExternalManifest }  from './modules/ExternalManifest.js';

export const VibeView = {
  container: null,

  /**
   * @property {boolean} _isManifesting
   * @description Guard flag preventing concurrent _manifestLogic() stacking.
   * B"H - Only ONE manifestation at a time. Like the Awtsmoos is ONE.
   */
  _isManifesting: false,

  /**
   * @function init
   * @description Acquires the root container element from the DOM.
   * @returns {void}
   */
  init() {
    this.container = document.getElementById('vibe-editor-wrapper');
  },

  /**
   * @async
   * @function render
   * @description
   * Primary render entry point. Rebuilds the shell on tab switch,
   * otherwise updates the chat history and syncs the sidebar state.
   *
   * @param {Object} tab        - The active Vibe tab state object.
   * @param {Object} controller - The Vibe controller instance.
   * @returns {Promise<void>}
   */
  async render(tab, controller) {
    console.log(`[VibeView] B"H - Render triggered for tab ${tab.id}`);
    if (!this.container) this.init();

    // ── ABSOLUTE NULL-SAFETY SHIELD ───────────────────────────────────────
    if (!tab.vibeSession) tab.vibeSession = tab.content || {};
    if (!tab.vibeSession.history)   tab.vibeSession.history   = [];
    if (!tab.vibeSession.viewState) tab.vibeSession.viewState = {
      activeSidebarTab: 'tree', isSidebarCollapsed: false
    };

    const sess = tab.vibeSession;

    // ── TAB CONTEXT SWITCH ────────────────────────────────────────────────
    if (this.container.dataset.tabId !== String(tab.id)) {
      console.log(`[VibeView] B"H - Switching tab context to ${tab.id}. Rebuilding shell.`);
      this.container.dataset.tabId = tab.id;
      this.container.innerHTML = VibeLayout.getHTML();

      // B"H - Only trigger _manifestLogic if not already manifesting.
      // This is the RENDER LOOP PROTECTION guard.
      if (!this._isManifesting) {
        requestAnimationFrame(() => this._manifestLogic(tab, controller));
      }
      return;
    }

    // ── DEFENSIVE COMPONENT CHECK ─────────────────────────────────────────
    if (!this.container.querySelector('.vibe-container')) {
      console.warn(`[VibeView] B"H - .vibe-container missing. Retrying render...`);
      requestAnimationFrame(() => this.render(tab, controller));
      return;
    }

    ChatHistory.render(this.container, sess.history, tab, controller);
    this._sync(tab, controller);
  },

  /**
   * @async
   * @function _manifestLogic
   * @description
   * Second phase of manifestation: Binding and Child Population.
   * Protected by _isManifesting to prevent concurrent stacking.
   * Once complete, triggers a single final render pass.
   *
   * @param {Object} tab        - The active Vibe tab state object.
   * @param {Object} controller - The Vibe controller instance.
   * @returns {Promise<void>}
   * @private
   */
  async _manifestLogic(tab, controller) {
    // B"H - Set guard IMMEDIATELY to block any concurrent calls.
    this._isManifesting = true;
    console.log(`[VibeView] B"H - _manifestLogic triggered for tab ${tab.id}`);

    try {
      ChatInput.bind(this.container, tab, controller);
      VibeSidebarBinder.bind(this.container, tab, () => this.render(tab, controller));
      VibeResizer.bind(this.container);

      const root = controller.getRootItem(tab);

      try {
        await VibeSidebarTree.refresh(this.container, root, controller);
      } catch (e) {
        console.error(`[VibeView] B"H - Tree refresh failed:`, e);
      }

      try {
        const manifestContainer = this.container.querySelector('#vibe-manifest-container');
        ExternalManifest.injectUI(manifestContainer, tab, root);
      } catch (e) {
        console.error(`[VibeView] B"H - External Manifest injection failed:`, e);
      }

    } finally {
      // B"H - ALWAYS release the guard, even if an error occurred.
      this._isManifesting = false;
    }

    // Final render pass to populate history and sync visuals.
    // At this point _isManifesting is false, so render() can proceed normally.
    this.render(tab, controller);
  },

  /**
   * @function _sync
   * @description Syncs sidebar state and panels without rebuilding the shell.
   * @param {Object} tab        - The active tab.
   * @param {Object} controller - The controller.
   * @returns {void}
   * @private
   */
  _sync(tab, controller) {
    if (this.container) {
      VibeStateSync.apply(this.container, tab);
      VibeSidebarPanels.sync(this.container, tab, controller);
    }
  }
};