
// B"H
/**
 * @file open-vibe.js
 * @brief RESONANCE PROTOCOL BINDINGS.
 */

import { ItemResolver } from '../utils/itemResolver.js';
import { Dialog } from '../utils/dialog.js';
import { VibeController } from '../../vibe/vibe-controller.js';

export default async function run(context) {
    let item = ItemResolver.resolve(context);

    if (!item || !item.path) {
        await Dialog.alert("B\"H\nSpatial misalignment error.\nThe necessary physical item origins required to tune dimensional Vibe layers cannot be acquired!");
        return;
    }

    // B"H - Vibe operates on a directory context. If a file is provided, ascend to its parent vessel.
    if (item.kind !== 'directory' && item.kind !== 'root') {
        const parts = item.path.split('/');
        parts.pop();
        const parentPath = parts.join('/') || '/';
        item = { ...item, path: parentPath, name: parentPath.split('/').pop() || item.name, kind: 'directory' };
    }
    
    console.log(`B"H - Initiating Vibe Resonance over coordinates: ${item.path}`);
    
    // B"H - The one true path to the Vibe world is through its controller.
    VibeController.open(item);
}
