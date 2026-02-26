
// B"H
/**
 * @file delete-workspace.js
 * @brief THE REMOVAL OF WORLDS.
 */

import { Workspaces } from '../../workspaces/index.js';
import { ItemResolver } from '../utils/itemResolver.js';
import { Dialog } from '../utils/dialog.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    if (!item) return;

    const confirmed = await Dialog.confirm(`B"H\nRemove workspace "${item.name}" from the list?\n(This does not delete files from disk)`);
    if (confirmed) {
        Workspaces.remove(item.workspaceId);
    }
}
