
// B"H
/**
 * @file vibe-view.js
 * @brief The Fractal Orchestrator. Rectified for recursive stability and null-safety.
 */

import { VibeLayout } from './view/sidebar/layout.js';
import { VibeResizer } from './view/resizer.js';
import { VibeSidebarTree } from './view/sidebar/tree.js';
import { ChatHistory } from './view/chat/history.js';
import { ChatInput } from './view/chat/input.js';
import { VibeSidebarBinder } from './view/sidebar/binder.js';
import { VibeSidebarPanels } from './view/sidebar/panels.js';
import { VibeStateSync } from './view/sidebar/state-sync.js';
import { ExternalManifest } from './modules/ExternalManifest.js';

export const VibeView = {
    container: null,
    init() { this.container = document.getElementById('vibe-editor-wrapper'); },

    async render(tab, controller) {
        console.log(`[VibeView] B"H - Render triggered for tab ${tab.id}`);
        if (!this.container) this.init();
        
        // B"H - ABSOLUTE NULL-SAFETY SHIELD
        // Ensure the vibeSession and its nested critical arrays exist before rendering
        if (!tab.vibeSession) {
            tab.vibeSession = tab.content || {};
        }
        if (!tab.vibeSession.history) tab.vibeSession.history = [];
        if (!tab.vibeSession.viewState) tab.vibeSession.viewState = { activeSidebarTab: 'tree', isSidebarCollapsed: false };
        
        const sess = tab.vibeSession;

        // If switching tabs, rebuild the layout shell
        if (this.container.dataset.tabId !== String(tab.id)) {
            console.log(`[VibeView] B"H - Switching tab context from ${this.container.dataset.tabId} to ${tab.id}. Rebuilding shell.`);
            this.container.dataset.tabId = tab.id;
            this.container.innerHTML = VibeLayout.getHTML();
            
            // Wait for DOM layout to stabilize
            requestAnimationFrame(() => this._manifestLogic(tab, controller));
            return;
        }

        // B"H - Defensive Component Rendering
        if (!this.container.querySelector('.vibe-container')) {
             console.warn(`[VibeView] B"H - .vibe-container missing. Retrying render...`);
             requestAnimationFrame(() => this.render(tab, controller));
             return;
        }

        ChatHistory.render(this.container, sess.history, tab, controller);
        this._sync(tab, controller);
    },

    /**
     * @function _manifestLogic
     * @description Second phase of manifestation: Binding and Child Population.
     */
    async _manifestLogic(tab, controller) {
        console.log(`[VibeView] B"H - _manifestLogic triggered for tab ${tab.id}`);
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
            console.log(`[VibeView] B"H - Injecting External Manifest UI into:`, manifestContainer);
            ExternalManifest.injectUI(manifestContainer, tab, root);
        } catch (e) {
            console.error(`[VibeView] B"H - External Manifest injection failed:`, e);
        }
        
        // Final render turn to populate history and sync visuals
        this.render(tab, controller);
    },

    _sync(tab, controller) {
        if (this.container) {
            VibeStateSync.apply(this.container, tab);
            VibeSidebarPanels.sync(this.container, tab, controller);
        }
    }
};
