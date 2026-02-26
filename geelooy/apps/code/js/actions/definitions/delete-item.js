
// B"H
/**
 * @file delete-item.js
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { ContextParser } from '../utils/context-parser.js';
import { ActionModal } from '../utils/modal.js';

export const DeleteItemAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
        if (!item) return;

        const confirmed = await ActionModal.confirm(`B"H\nAre you absolutely certain you wish to obliterate '${item.name}' from reality?`);
        if (!confirmed) return;

        console.log("B\"H - Delete: Dissolving ->", item.path);
        return await FileSystemProvider.delete(item);
    }
};
