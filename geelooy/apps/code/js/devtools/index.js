
// B"H
/**
 * @file index.js (devtools)
 * @brief The Master Orchestrator with Re-attachment and Session Recovery.
 */

import { DevToolsUI } from './ui.js';
import { DevToolsBridge } from './bridge.js';

export class DevTools {
    constructor(container, tab) {
        this.container = container;
        this.tab = tab;
        
        // B"H - PERSISTENCE RITUAL
        // Ensure the bridge uses the tab's specific state (which might have come from the session load)
        this.state = DevToolsBridge.getTabPersistentState(
            tab.item.previewTabId, 
            tab.devtoolsState // This carries the activePanel, selectedPath, and expandedPaths
        );
        
        // Ensure tab object itself references the bridge-managed state
        this.tab.devtoolsState = this.state;
        
        DevToolsBridge.init();
        this.init();
    }

    init() {
        // B"H - RE-ATTACHMENT: If we already have the DOM manifested, just append it.
        if (this.state.mainWrapper && this.state.mainWrapper.parentNode !== this.container) {
            console.log("B\"H - DevTools: Re-attaching existing manifestation.");
            this.container.innerHTML = '';
            this.container.appendChild(this.state.mainWrapper);
            
            // Check for new inspection requests
            if (this.state.inspectPath && this.state.onInspectRequested) {
                this.state.onInspectRequested();
            }
            return;
        }

        // INITIAL CREATION: Manifest the UI from data
        DevToolsUI.render(this.container, this.state);
    }
}
