
// B"H
/**
 * @file open.js
 * @brief Logic for targeting and opening DevTools.
 */

import { State } from '../state.js';
import { DevTools } from './index.js';

export const DevToolsOpener = {
    /**
     * B"H - Opens the DevTools vision for a specific tab or the current active preview.
     */
    open(tab) {
        if (!tab) {
            // Seek the active mirror
            tab = State.tabs.find(t => t.active && t.item.type === 'html-preview-file');
        }

        if (!tab) {
            console.warn("B\"H - DevTools Opener: No active preview vessel found.");
            return;
        }

        console.log(`B\"H - DevTools: Opening on Tab [${tab.id}]`);

        if (tab.openDevTools) {
            tab.openDevTools();
        } else {
            // Signal the tab to show its internal DevTools panel
            tab.showDevTools = true;
            if (typeof tab.onUpdate === 'function') {
                tab.onUpdate();
            }
        }
    }
};

/**
 * B"H - Initializes the static link between the system and the DevTools class.
 */
export function initializeDevToolsStatics() {
    DevTools.openForActivePreview = () => DevToolsOpener.open();
}
