
// B"H
/**
 * @file reveal-in-workspace.js
 * @brief Focuses the File Explorer on a specific physical item.
 */

import { FileCommander } from '../../file-commander.js';
import { ContextParser } from '../utils/context-parser.js';

export const RevealInWorkspaceAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
console.log("Getting",item, context)
        if (!item) {
            console.warn("B\"H - Reveal: No item found in the void.");
            return;
        }

        console.log("B\"H - Reveal: Focusing on physical path ->", item.path);
        
        // Force the explorer panel open if it was hidden
        const leftPanel = document.getElementById('left-panel');
        if (leftPanel && leftPanel.classList.contains('hidden')) {
            leftPanel.classList.remove('hidden');
        }

        if (FileCommander && typeof FileCommander.reveal === 'function') {
            return await FileCommander.reveal(item);
        } else {
            console.error("B\"H - Reveal: FileCommander is not manifested in this realm.");
        }
    }
};
