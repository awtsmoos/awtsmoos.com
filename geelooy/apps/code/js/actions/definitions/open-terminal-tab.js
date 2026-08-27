
// B"H
/**
 * @file open-terminal-tab.js
 * @brief Opens a new system-level Terminal tab.
 */

import { Tabs } from '../../tabs/index.js';

export const OpenTerminalTabAction = {
    async run() {
        console.log("B\"H - Terminal: Opening global command vessel.");
        
        const terminalItem = {
            id: `term-root-${Date.now()}`,
            name: `Terminal`,
            path: '/',
            kind: 'root',
            type: 'terminal'
        };

        return Tabs.create(terminalItem);
    }
};
