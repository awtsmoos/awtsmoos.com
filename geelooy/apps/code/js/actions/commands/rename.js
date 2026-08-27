
// B"H
/**
 * @file rename.js
 * @brief THE ALTERATION OF IDENTITY.
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { TreeHelper } from './tree-helper.js';
import { Dialog } from '../utils/dialog.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    if (!item) {
        console.warn("B\"H - Rename failed: Lost referential anchor.");
        return;
    }

    const newName = await Dialog.prompt(`B"H\nConfer the new identity for: ${item.name}`, item.name);
    if (!newName || newName === item.name || newName.trim() === "") return;

    try {
        await FileSystemProvider.rename(item, newName);
        console.log(`B"H - Record amended. Entity is now: ${newName}`);
        
        const parts = item.path.split('/');
        parts.pop();
        const pPath = parts.join('/') || '/';
        const parentItem = { ...item, path: pPath, kind: 'directory' };
        
        TreeHelper.refresh(parentItem);

    } catch(e) {
        console.error("B\"H - Sequence corrupted during name transition.", e);
        await Dialog.alert(`B"H\nTransmutation hindered: ${e.message}`);
    }
}
