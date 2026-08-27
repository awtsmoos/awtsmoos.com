
// B"H
/**
 * @file new-folder.js
 * @brief CREATION OF MULTIPLICITY CHAMBER.
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';
import { TreeHelper } from './tree-helper.js';
import { Dialog } from '../utils/dialog.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    let item = ItemResolver.resolve(context);
    
    // B"H - If no context, find an active or first workspace as the root.
    if (!item) {
        const ws = State.workspaces.find(w => w.isActive) || State.workspaces[0];
        if (!ws) {
            await Dialog.alert("B\"H\nNo active workspace anchor found.");
            return;
        }
        item = { ...ws, kind: 'directory', path: '/' };
    } else if (item.kind !== 'directory') {
        const parts = item.path.split('/');
        parts.pop(); 
        item = { ...item, path: parts.join('/') || '/', kind: 'directory' };
    }

    const name = await Dialog.prompt("B\"H\nSpeak the name of the new boundary (Folder):");
    if (!name || name.trim() === "") return;

    try {
        await FileSystemProvider.create(item, name, 'directory');
        await TreeHelper.refresh(item);
    } catch (e) {
        console.error("B\"H - Formation Failed:", e);
        await Dialog.alert(`Failed to expand space: ${e.message}`);
    }
}
