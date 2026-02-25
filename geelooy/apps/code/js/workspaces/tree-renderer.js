
// B"H
// FILE: js/workspaces/tree-renderer.js

import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { TreeItemForge } from './tree-item.js';
import { getItemUniquePath } from './utils.js';

/**
 * @class WorkspaceTreeRenderer
 * @classdesc In the high realms of Atziluth, all is one, but as light descends 
 * through the Seder Hishtalshelus, it must take on form and boundary. This 
 * class is the architect of those boundaries, building the nested tree of 
 * files that represents the fractured unity of your project. It turns the 
 * infinite speech of the Awtsmoos into visible, clickable branches.
 */
export const WorkspaceTreeRenderer = {
    /**
     * @async
     * @function renderTree
     * @description A recursive ritual of revelation. It peers into the 
     * specified parent directory and emanates its children into the DOM.
     * Each child is a unique spark, manifested with its own interactive soul.
     * @param {HTMLElement} parentEl The physical container for the new branch.
     * @param {object} parentItem The directory whose inner life is being revealed.
     * @param {number} depth The level of descent into the hierarchy.
     */
    async renderTree(parentEl, parentItem, depth) {
        if (!parentEl || !parentItem) return;

        parentEl.innerHTML = '<li class="tree-item-loading">...</li>';

        try {
            const res = await FileSystemProvider.list(parentItem);
            const children = Array.isArray(res) ? res : (res.entries || []);
            
            parentEl.innerHTML = ''; // Dissolve the loading state

            if (children.length === 0) {
                parentEl.innerHTML = '<li class="tree-item-empty">Empty Vessel</li>';
                return;
            }

            // Sort: Folders precede Files, then alphabetical by the Word
            children.sort((a, b) => {
                if (a.kind === b.kind) return a.name.localeCompare(b.name);
                return a.kind === 'directory' ? -1 : 1;
            });

            const fragment = document.createDocumentFragment();
            for (const child of children) {
                const fullItem = { ...parentItem, ...child, workspaceId: parentItem.workspaceId || parentItem.id };
                const li = TreeItemForge.create(fullItem, depth);
                fragment.appendChild(li);
            }
            parentEl.appendChild(fragment);
        } catch (e) {
            parentEl.innerHTML = `<li class="tree-item-error">Failed: ${e.message}</li>`;
        }
    },

    /**
     * @function toggleDirectory
     * @description The heartbeat of the Explorer. Expansion (Chesed) and 
     * Contraction (Gevurah). This function opens the gates of a folder 
     * or seals them tight, managing the lifecycle of the branch's presence.
     * @param {string} uniquePath The absolute identity of the folder.
     * @param {HTMLElement} liElement The DOM form that will expand.
     * @param {object} item The data essence of the folder.
     * @param {number} depth The level of this folder in the world.
     */
    toggleDirectory(uniquePath, liElement, item, depth) {
        if (!liElement) return;

        if (State.expandedFolders.has(uniquePath)) {
            State.expandedFolders.delete(uniquePath);
            liElement.classList.remove('expanded');
            const ul = liElement.querySelector('ul');
            if (ul) ul.remove();
        } else {
            State.expandedFolders.add(uniquePath);
            liElement.classList.add('expanded');
            const ul = document.createElement('ul');
            liElement.appendChild(ul);
            this.renderTree(ul, item, depth + 1);
        }
        
        // Record the state in the eternal book of session
        import('../app/index.js').then(m => m.App.saveSessionDebounced());
    }
};
