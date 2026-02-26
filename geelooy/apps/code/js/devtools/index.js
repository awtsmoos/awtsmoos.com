
// B"H
/**
 * @file index.js (devtools)
 * @brief The Master Orchestrator of the DevTools vision.
 */

import { HTML } from '../../html-generator.js';
import { ConsolePanel } from './panels/console/index.js';
import { ElementsPanel } from './panels/elements/index.js';
import { SplitDevToolsLayout } from './layout/split-layout.js';
import { initializeDevToolsStatics } from './open.js';

/**
 * B"H - The DevTools chariot.
 */
export class DevTools {
    constructor(container, tabId) {
        this.container = container;
        this.tabId = tabId;
        this.panels = {};
        this.init();
    }

    init() {
        // 1. Manifest Console Vessel
        const consoleEl = HTML({ style: { height: '100%', width: '100%' } });
        this.panels.console = ConsolePanel.attach(consoleEl);
        ConsolePanel.setPreviewTabId(this.tabId);

        // 2. Manifest Elements Vessel
        const elementsEl = HTML({ style: { height: '100%', width: '100%' } });
        this.panels.elements = ElementsPanel.attach(elementsEl, this.tabId);

        const upper = [
            { id: 'elements', name: 'Elements', el: elementsEl }
        ];

        // 3. Unify in Split Layout
        SplitDevToolsLayout.mount(this.container, upper, consoleEl);
    }

    log(obj) {
        if (this.panels.console && this.panels.console.log) {
            this.panels.console.log(obj);
        }
    }

    updateElements(html) {
        if (this.panels.elements && this.panels.elements.update) {
            this.panels.elements.update(html);
        }
    }
}

// B"H - Inject the static revelation into the class
initializeDevToolsStatics();
