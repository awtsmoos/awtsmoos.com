
/**
 * B"H
 * @module NerveCenter
 * @description
 * This module connects the physical events (clicks, inputs) to the 
 * Navigator's mind. Most events are now manifest directly in the 
 * JSON blueprints, but global rituals like 'popstate' or 
 * high-level management belong here.
 */

import { DOMElements } from './dom.js';
import * as ui from './ui.js';
import { appState } from './state.js';

/**
 * @function initializeEventListeners
 * @description Establishes the global connections of intent.
 */
export function initializeEventListeners(navigator) {
    
    // 1. Initialize the Portal of Creation (Modal)
    import('./modal.js').then(m => m.initializeModal());

    // 2. Global History Ritual
    window.addEventListener('popstate', () => {
        const params = new URLSearchParams(window.location.search);
        navigator.currentView = params.get('view') || 'posts';
        navigator.loadContent(params.get('series') || 'root');
    });

    // 3. UI-specific rituals that require direct monitoring
    setupSidebarHoverRituals();

    // 4. Durable social notifications for the current alias
    if (window.curAlias) {
        import('./ui/notificationsPanel.js').then(module => {
            module.mountNotificationsPanel({ root: document.body, aliasId: window.curAlias });
        });
    }

    // 5. Feed/search/live/db sharing tools
    import('./ui/platformPanel.js').then(module => {
        module.mountPlatformPanel({
            root: document.body,
            heichelId: appState.heichelId,
            aliasId: window.curAlias || ''
        });
    });

}

/**
 * @private
 */
function setupSidebarHoverRituals() {
    if (!DOMElements.editorsSection) return;
    
    DOMElements.editorsSection.addEventListener("click", () => {
        DOMElements.editorHolder.classList.toggle("extended");
    });
}
