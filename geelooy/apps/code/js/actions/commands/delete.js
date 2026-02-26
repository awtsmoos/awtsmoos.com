
// B"H
/**
 * @file delete.js
 * @brief DECREE OF ANNIHILATION.
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { TreeHelper } from './tree-helper.js';
import { Dialog } from '../utils/dialog.js';
import { ItemResolver } from '../utils/itemResolver.js';
import { Tabs } from '../../tabs/index.js';
import { State } from '../../state.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    if (!item) {
        console.warn("B\"H - Deletion prevented. Could not pinpoint object location.");
        return;
    }

    const goAhead = await Dialog.confirm(`B"H\nIs it truly your decree to wipe '${item.name}' out of existence forever?`);
    if (!goAhead) return;

    try {
        console.log(`B"H - Severing physical bonds to: ${item.path}`);
        
        // Close any open tabs related to this item BEFORE deleting
        const uniquePath = Tabs.getUniquePath(item);
        const tab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (tab) {
            await Tabs.close(tab.id, true);
        }

        await FileSystemProvider.delete(item);
        
        const parts = item.path.split('/');
        parts.pop();
        const pPath = parts.join('/') || '/';
        const parentItem = { ...item, path: pPath, kind: 'directory' };
        
        await TreeHelper.refresh(parentItem);

    } catch(e) {
        console.error("B\"H - Subjugation failed.", e);
        await Dialog.alert(`B"H\nThe vessel remains unyielding: ${e.message}`);
    }
}
