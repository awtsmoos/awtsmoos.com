
// B"H
// FILE: js/workspaces/tree-renderer.js

import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { TreeItemForge } from './tree-item.js';

/**
 * @class WorkspaceTreeRenderer
 * @classdesc The architect of the project tree. 
 * Re-forged to ensure sub-folders don't steal the Git Root icon, 
 * while maintaining the correct behavioral context.
 */
export const WorkspaceTreeRenderer = {
    /**
     * @async
     * @function renderTree
     * @description B"H. Emanates a new branch of the project tree.
     * @param {HTMLElement} parentEl The physical container.
     * @param {object} parentItem The directory being revealed.
     * @param {number} depth The level of descent.
     */
    async renderTree(parentEl, parentItem, depth) {
        if (!parentEl || !parentItem) return;

        parentEl.innerHTML = '<li class="tree-item-loading">...</li>';

        try {
            const res = await FileSystemProvider.list(parentItem);
            const children = Array.isArray(res) ? res : (res.entries || []);
            
            // B"H - Detect if THIS folder is the start of a Git clone
            const containsGitMarker = children.some(c => c.name === '.awtsmoos-repo');
            if (containsGitMarker) {
                parentItem.isGitClone = true;
                parentItem._isDetectedGitRoot = true; // Sacred marker for icon logic
                this._markAsGitRoot(parentItem);
            }

            parentEl.innerHTML = ''; 

            if (children.length === 0) {
                parentEl.innerHTML = '<li class="tree-item-empty">Empty Vessel</li>';
                return;
            }

            children.sort((a, b) => {
                if (a.kind === b.kind) return a.name.localeCompare(b.name);
                return a.kind === 'directory' ? -1 : 1;
            });

            const fragment = document.createDocumentFragment();
            for (const child of children) {
                const fullItem = { 
                    ...parentItem, 
                    ...child, 
                    workspaceId: parentItem.workspaceId || parentItem.id,
                    // Sub-folders/files inherit the 'isGitClone' status for actions, 
                    // but NOT the root marker.
                    isGitClone: parentItem.isGitClone,
                    _isDetectedGitRoot: false 
                };
                const li = TreeItemForge.create(fullItem, depth);
                fragment.appendChild(li);
            }
            parentEl.appendChild(fragment);
        } catch (e) {
            parentEl.innerHTML = `<li class="tree-item-error">Failed: ${e.message}</li>`;
        }
    },

    /**
     * @function _markAsGitRoot
     * @description Ensures the UI reflects the Git status of the actual repo root.
     */
    _markAsGitRoot(item) {
        import('./utils.js').then(m => {
            const pathKey = m.getItemUniquePath(item);
            const entry = State.domItemMap.get(pathKey);
            if (entry && entry.el) {
                const iconUse = entry.el.querySelector('.tree-item-name-wrap use');
                if (iconUse) iconUse.setAttribute('href', '#icon-git-folder');
            }
        });
    },

    /**
     * @function toggleDirectory
     * @description Managing the expansion and contraction of the vessels.
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
        
        import('../app/index.js').then(m => m.App.saveSessionDebounced());
    }
};
