
// B"H
/**
 * @file tree-helper.js
 * @brief THE RESURRECTION OF THE DOM.
 * 
 * THE HYMN OF THE AWAKENING:
 * A file is made, a folder destroyed,
 * But the eye sees only the static void!
 * Blow the trumpet, strike the stone,
 * Tell the Explorer it is not alone.
 * We pulse the event, we click on the root,
 * Ensuring the Tree brings forth new fruit.
 */

import { Workspaces } from '../../workspaces/index.js';

export const TreeHelper = {
    /**
     * B"H - Instantly and reliably forces the file explorer to sync with reality
     * by calling the one true source of UI manifestation.
     * @param {Object} parentItem The directory that was affected and needs re-rendering.
     */
    async refresh(parentItem) {
        console.log(`B"H - TreeHelper: Awakening the Explorer for ${parentItem?.path || 'Root'}`);
        if (!parentItem) return;
        
        // Dispatch spiritual events for any other listening systems
        window.dispatchEvent(new CustomEvent('awtsmoos-fs-changed', { detail: { item: parentItem } }));
        window.dispatchEvent(new Event('fs-update'));

        // The most reliable way is to use the Workspace manager's own refresh logic
        await Workspaces.refreshNode(parentItem);
    }
};
