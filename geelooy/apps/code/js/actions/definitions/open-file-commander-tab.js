
// B"H
/**
 * @file open-file-commander-tab.js
 * @brief Opens a new system-level Explorer tab.
 */

import { Tabs } from '../../tabs/index.js';

export const OpenFileCommanderTabAction = {
    async run() {
        console.log("B\"H - Explorer: Opening global commander vessel.");
        
        const explorerItem = {
            id: `fc-root-${Date.now()}`,
            name: `Explorer`,
            path: '/',
            kind: 'root',
            type: 'file-commander'
        };

        return Tabs.create(explorerItem);
    }
};
