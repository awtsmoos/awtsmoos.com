
// B"H
/**
 * @file browse-in-commander.js
 */

import { FileCommander } from '../../file-commander.js';
import { ContextParser } from '../utils/context-parser.js';

export const BrowseInCommanderAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
        if (!item) return;

        console.log("B\"H - Browse: Navigating commander into ->", item.path);
        
        if (item.kind === 'directory' || item.kind === 'root') {
            if (FileCommander && typeof FileCommander.open === 'function') {
                return await FileCommander.open(item);
            }
        } else {
            // If it's a file, reveal it instead of trying to open it as a folder
            if (FileCommander && typeof FileCommander.reveal === 'function') {
                return await FileCommander.reveal(item);
            }
        }
    }
};
