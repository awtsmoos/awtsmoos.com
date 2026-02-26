
// B"H
/**
 * @file workspace.js
 * @brief "Reveal in Workspace" alias handling.
 */

import { FileCommander } from '../../file-commander.js';
import { ContextParser } from '../utils/context-parser.js';

export const WorkspaceAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
        if (!item) return;

        console.log("B\"H - Reveal: Focusing on physical path ->", item.path);
        
        if (FileCommander && typeof FileCommander.reveal === 'function') {
            return await FileCommander.reveal(item);
        } else {
            console.error("B\"H - FileCommander is unformed in this realm.");
        }
    }
};
