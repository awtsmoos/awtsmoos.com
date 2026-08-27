
// B"H
/**
 * @file index.js (devtools)
 * @brief The Master Orchestrator with Re-attachment and Session Recovery.
 */

import { DevToolsUI } from './ui.js';
import { DevToolsBridge } from './bridge.js';

export class DevTools {
    /**
     * B"H
     * @param {HTMLElement} container - The physical DOM vessel.
     * @param {Object} tab - The Tab metadata from State.
     */
    constructor(container, tab) {
        this.container = container;
        this.tab = tab;
        
        // 1. THE AGGRESSIVE IDENTITY SEARCH (Rectified)
        let targetId = tab.item.previewTabId;
        
        // If metadata is empty, we peer into the sacred URI
        if (!targetId || targetId === "undefined" || targetId === "null") {
            const pathId = tab.item.path?.split('://')[1];
            if (pathId && pathId !== "undefined") {
                targetId = pathId;
                tab.item.previewTabId = targetId;
                console.log(`[DevTools] B"H - Extracted Vision ID from Path: ${targetId}`);
            }
        }

        // If still unknown, we gaze upon the Earthly iframes
        if (!targetId || targetId === "undefined") {
            const iframes = document.querySelectorAll('iframe.browser-iframe');
            if (iframes.length > 0) {
                targetId = iframes[iframes.length - 1].dataset.tabId;
                tab.item.previewTabId = targetId;
                console.log(`[DevTools] B"H - Seized Vision ID from DOM: ${targetId}`);
            }
        }

        console.log(`%cB"H [DevTools] Initializing Dimension for Vision [${targetId}]`, "color: #a8ff00; font-weight: bold;");

        // 2. RETRIEVAL OF THE SINGULAR SOUL
        this.state = DevToolsBridge.getTabPersistentState(
            targetId, 
            tab.devtoolsState 
        );
        
        // Force the state back into the tab for session persistence
        this.tab.devtoolsState = this.state;
        this.tab.item.previewTabId = targetId;
        
        DevToolsBridge.init();
        this.init();
    }

    init() {
        console.log(`B"H [DevTools init] Requesting UI Manifestation for Vision: ${this.state.previewTabId}`);
        DevToolsUI.render(this.container, this.state);
    }
}
