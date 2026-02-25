
// B"H
// FILE: js/workspaces/tree-item.js

import { State } from '../state.js';
import { Menus } from '../menus/index.js';
import { Tabs } from '../tabs/index.js';
import { SelectionManager } from '../selection-manager.js';
import { WorkspaceTreeRenderer } from './tree-renderer.js';
import { getItemUniquePath } from './utils.js';

/**
 * @class TreeItemForge
 * @classdesc The smithy where the physical forms of the project's elements are struck.
 * 
 * THE POEM OF THE ICON:
 * In the root, the symbol glows with the chain of the timeline,
 * A git-folder manifested, a memory of what was and will be.
 * But as we descend into the branches, the form becomes humble,
 * A standard folder, yet carrying the same holy actions of its parent,
 * For the essence of the root flows through every leaf.
 * The Awtsmoos creates the distinction so the eye may find rest,
 * While the soul remains connected to the totality.
 */
export const TreeItemForge = {
    /**
     * @function create
     * @description B"H. Forges a single branch (li) for the workspace tree.
     * It correctly selects the icon: git-folder ONLY for the root of a clone,
     * standard folder for children, and file for the leaves.
     * @param {object} item The data essence of the file or folder.
     * @param {number} depth The measure of indentation.
     * @returns {HTMLElement} The manifested branch.
     */
    create(item, depth) {
        const uniquePath = getItemUniquePath(item);
        const isDir = item.kind === 'directory';
        const li = document.createElement('li');
        li.className = `tree-item ${isDir ? 'dir' : 'file'}`;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'tree-item-name-wrap';
        wrapper.style.paddingLeft = `${depth * 12}px`;
        
        // B"H - Rectified Icon Logic:
        // A directory gets the git-folder icon ONLY if it is the explicit root of a clone.
        // We detect this by checking if it HAS the isGitClone property AND is at path '/' 
        // OR is the parent of a detected .awtsmoos-repo.
        let icon = 'file';
        if (isDir) {
            const isActualRoot = item.path === '/' || item.path === '' || item.isWorkspaceRoot;
            const isCloneRoot = item.isGitClone && (isActualRoot || item._isDetectedGitRoot);
            
            icon = isCloneRoot ? 'git-folder' : 'folder';
        }
        
        wrapper.innerHTML = `
            <span class="tree-item-arrow">${isDir ? '▶' : '•'}</span>
            <svg class="svg-icon"><use href="#icon-${icon}"></use></svg>
            <span class="tree-item-name">${item.name}</span>
        `;

        wrapper.onclick = (e) => {
            e.stopPropagation();
            if (State.isSelectionModeActive) {
                SelectionManager.toggle(item);
            } else if (isDir) {
                WorkspaceTreeRenderer.toggleDirectory(uniquePath, li, item, depth);
            } else {
                Tabs.create(item);
            }
        };

        wrapper.oncontextmenu = (e) => {
            State.contextEvent = e;
            Menus.show(e, item);
        };

        li.appendChild(wrapper);
        State.domItemMap.set(uniquePath, { el: li, item });

        if (isDir && State.expandedFolders.has(uniquePath)) {
            li.classList.add('expanded');
            const ul = document.createElement('ul');
            li.appendChild(ul);
            setTimeout(() => WorkspaceTreeRenderer.renderTree(ul, item, depth + 1), 0);
        }

        return li;
    }
};
