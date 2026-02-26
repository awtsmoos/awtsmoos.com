
// B"H
/**
 * @file rename-item.js
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { ContextParser } from '../utils/context-parser.js';
import { ActionModal } from '../utils/modal.js';

export const RenameItemAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
        if (!item) return;

        const newName = await ActionModal.prompt(`B"H\nRename ${item.name} to:`, item.name);
        if (!newName || newName === item.name) return;

        console.log(`B\"H - Rename: ${item.name} -> ${newName}`);
        return await FileSystemProvider.rename(item, newName);
    }
};
