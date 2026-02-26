
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
        this.state = tab.devtoolsState;
        
        // This is the sacred bond. The Bridge now knows which state belongs to which preview.
        DevToolsBridge.attach(this.state);
        
        this.init();
    }

    init() {
        // B"H - The UI Renderer now receives the specific state for this instance.
        DevToolsUI.render(this.container, this.state);
    }
}

// B"H - This file no longer needs the static initializer as it's handled externally.
