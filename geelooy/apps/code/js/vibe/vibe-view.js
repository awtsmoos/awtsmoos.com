
// B"H
/**
 * @file vibe-view.js
 * @brief The Fractal Orchestrator.
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
        
        if (!tab.vibeSession) tab.vibeSession = tab.content || {};
        if (!tab.vibeSession.history) tab.vibeSession.history =[];
        if (!tab.vibeSession.viewState) tab.vibeSession.viewState = { activeSidebarTab: 'tree', isSidebarCollapsed: false };
        
        const sess = tab.vibeSession;

        if (this.container.dataset.tabId !== String(tab.id)) {
            console.log(`[VibeView] B"H - Switching tab context. Rebuilding shell.`);
            this.container.dataset.tabId = tab.id;
            
            // B"H - Manifesting from pure JSON blueprints instead of messy strings
            this.container.innerHTML = '';
            this.container.appendChild(VibeLayout.build());
            
            requestAnimationFrame(() => this._manifestLogic(tab, controller));
            return;
        }

        if (!this.container.querySelector('.vibe-container')) {
             console.warn(`[VibeView] B"H - .vibe-container missing. Retrying render...`);
             requestAnimationFrame(() => this.render(tab, controller));
             return;
        }

        ChatHistory.render(this.container, sess.history, tab, controller);
        this._sync(tab, controller);
    },

    async _manifestLogic(tab, controller) {
        console.log(`[VibeView] B"H - Binding Logic`);
        ChatInput.bind(this.container, tab, controller);
        VibeSidebarBinder.bind(this.container, tab, () => this.render(tab, controller));
        VibeResizer.bind(this.container);
        
        const root = controller.getRootItem(tab);
        
        try { await VibeSidebarTree.refresh(this.container, root, controller); } catch (e) {}
        try { ExternalManifest.injectUI(this.container.querySelector('#vibe-manifest-container'), tab, root); } catch (e) {}
        
        this.render(tab, controller);
    },

    _sync(tab, controller) {
        if (this.container) {
            VibeStateSync.apply(this.container, tab);
            VibeSidebarPanels.sync(this.container, tab, controller);
        }
    }
};
