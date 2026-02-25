
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
 * @classdesc The master smithy where the physical forms of the project's 
 * elements are struck. It takes the undifferentiated data of an item 
 * and hammers it into a clickable, reactive vessel.
 */
export const TreeItemForge = {
    /**
     * @function create
     * @description B"H. Forges a single branch (li) for the workspace tree.
     * It correctly selects the icon based on whether the folder is a 
     * Git repository or a standard vessel.
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
        
        // B"H - Icon selection logic: Git icon takes precedence for repos
        const icon = isDir ? (item.isGitClone ? 'git-folder' : 'folder') : 'file';
        
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
