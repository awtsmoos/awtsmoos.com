
// B"H
/**
 * @file index.js (devtools)
 * @brief The Master Orchestrator of the DevTools vision.
 */

import { HTML } from '../../html-generator.js';
import { DevToolsUI } from './ui.js';
import { DevToolsBridge } from './bridge.js';

/**
 * B"H - The DevTools chariot.
 */
export class DevTools {
    constructor(container, tab) {
        this.container = container;
        this.tab = tab;
        
        // B"H - RECTIFIED STATE SOURCE
        // Instead of a fresh state object, we ask the Bridge for the persistent memory of this tab.
        this.state = DevToolsBridge.getTabPersistentState(tab.item.previewTabId);
        
        DevToolsBridge.init();
        
        this.init();
    }

    init() {
        // B"H - The UI Renderer now receives the specific state for this instance.
        DevToolsUI.render(this.container, this.state);
    }
}
