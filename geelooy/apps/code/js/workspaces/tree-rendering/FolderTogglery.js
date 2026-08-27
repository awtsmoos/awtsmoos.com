
// B"H
/**
 * @file FolderTogglery.js
 * @brief Managing the expansion and contraction of directories.
 */

import { State } from '../../state.js';
import { App } from '../../app.js';
import { getItemUniquePath } from '../utils.js';
import { NodeRegistry } from '../manager/NodeRegistry.js';

export const FolderTogglery = {
    /**
     * B"H - Toggles the visibility of a folder's children.
     */
    async toggle(item, depth, renderFn) {
        const uniquePath = getItemUniquePath(item);
        const entry = NodeRegistry.get(uniquePath);
        if (!entry) {
            console.warn("B\"H - Toggery blocked: Node registry is empty for " + uniquePath);
            return;
        }

        const li = entry.el;

        if (State.expandedFolders.has(uniquePath)) {
            State.expandedFolders.delete(uniquePath);
            li.classList.remove('expanded');
            const existingUl = li.querySelector('ul');
            if (existingUl) existingUl.remove();
        } else {
            State.expandedFolders.add(uniquePath);
            li.classList.add('expanded');
            const newUl = document.createElement('ul');
            newUl.className = 'tree-branch';
            li.appendChild(newUl);
            
            await renderFn(newUl, item, depth + 1);
        }
        
        App.saveSessionDebounced();
    }
};
