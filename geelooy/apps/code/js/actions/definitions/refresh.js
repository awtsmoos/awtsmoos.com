
// B"H
/**
 * @file refresh.js
 */

import { FileCommander } from '../../file-commander.js';

export const RefreshAction = {
    async run() {
        console.log("B\"H - Refresh: Breathing new life into the visual hierarchy.");
        if (FileCommander && typeof FileCommander.refresh === 'function') {
            return await FileCommander.refresh();
        }
    }
};
