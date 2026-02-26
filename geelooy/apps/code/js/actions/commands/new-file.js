
// B"H
/**
 * @file new-file.js
 * @brief THE BIRTH OF A DATA VESSEL.
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';
import { TreeHelper } from './tree-helper.js';
import { Dialog } from '../utils/dialog.js';
import { ItemResolver } from '../utils/itemResolver.js';
import { Tabs } from '../../tabs/index.js';

export default async function run(context) {
    let item = ItemResolver.resolve(context);
    
    // B"H - If no context, find an active or first workspace as the root.
    if (!item) {
        const ws = State.workspaces.find(w => w.isActive) || State.workspaces[0];
        if (!ws) {
            await Dialog.alert("B\"H\nYou are standing outside the Workspace walls. Navigate inward first.");
            return;
        }
        item = { ...ws, kind: 'directory', path: '/' };
    } else if (item.kind !== 'directory') {
        const parts = item.path.split('/');
        parts.pop(); 
        item = { ...item, path: parts.join('/') || '/', kind: 'directory' };
    }

    const name = await Dialog.prompt("B\"H\nName the new document of potential:");
    if (!name || name.trim() === "") return;

    console.log(`B"H - Inscribing the foundation for file '${name}' within '${item.path}'`);
    
    try {
        await FileSystemProvider.create(item, name, 'file');
        const finalPath = item.path === '/' ? `/${name}` : `${item.path}/${name}`;
        
        await TreeHelper.refresh(item);
        console.log(`B"H - Manifestation successful: ${finalPath}`);
        
        // B"H - Open the newly created vessel for immediate inscription.
        const newFileItem = { ...item, name, path: finalPath, kind: 'file', content: "" };
        Tabs.create(newFileItem, true);

    } catch (e) {
        console.error("B\"H - Vessel Creation Exception:", e);
        await Dialog.alert(`Creation blocked: ${e.message}`);
    }
}
