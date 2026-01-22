// B"H
// FILE: js/workspaces/tree-rendering.js

import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Menus } from '../menus.js';
import { Tabs } from '../tabs.js';
import { App } from '../app.js';
import { SelectionManager } from '../selection-manager.js';
import { getItemUniquePath, Workspaces } from '../workspaces.js';

export const WorkspaceTreeRenderer = {
    /**
     * B"H - Renders the file tree with Divine recursion.
     * @param {HTMLElement} parentElement - The container.
     * @param {object} parentItem - The directory to list.
     * @param {number} depth - Visual depth.
     * @param {boolean} registerDom - Whether to register in global DOM map.
     * @param {object} options - { onFileClick: (item) => void } - Custom click handler.
     */
    async renderTree(parentElement, parentItem, depth, registerDom = true, options = {}) {
        parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Loading...</li>`;
        try {
            let children;
            const workspace = State.workspaces.find(ws => ws.id === parentItem.workspaceId);

            if (parentItem.type === 'github' && workspace) {
                if (!workspace._treeCache) {
                     await FileSystemProvider.GitHub.getFullTree(parentItem); 
                }
                const lookupPath = parentItem.path === '/' ? '' : parentItem.path;
                children = workspace._treeCache?.get(lookupPath) || [];
            } else {
                children = await FileSystemProvider.list(parentItem);
            }

            parentElement.innerHTML = '';
            if (!Array.isArray(children)) children = [];
            children.sort((a, b) => (a.kind === b.kind) ? a.name.localeCompare(b.name) : (a.kind === 'directory' ? -1 : 1));

            if (children.length === 0) {
                parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary); font-style: italic;">Empty</li>`;
                return;
            }

            const fragment = document.createDocumentFragment();

            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (!child || child.name === '.gitkeep') continue;
                
                const fullChildItem = { ...parentItem, ...child };
                if (fullChildItem.handle) delete fullChildItem.handle;
                delete fullChildItem.isGitClone;
                
                const uniquePath = getItemUniquePath(fullChildItem);
                const icon = (child.kind === 'directory' ? 'folder' : 'file');
                
                const li = document.createElement('li');
                li.className = 'tree-item';
                li.style.setProperty('--depth', depth);
                li.innerHTML = `
                    <div class="tree-item-name-wrap">
                        <span class="tree-item-arrow">${child.kind === 'directory' ? '▶' : '•'}</span>
                        <svg class="svg-icon"><use href="#icon-${icon}"/></svg>
                        <span class="tree-item-name">${child.name}</span>
                    </div>`;
                fragment.appendChild(li);
                
                const nameWrap = li.querySelector('.tree-item-name-wrap');
                
                // B"H - CRITICAL RESTORATION: Drag & Drop Binding
                if (child.kind === 'directory') {
                    Workspaces.setupDragDrop(nameWrap, fullChildItem);
                }
                
                // Click Handler
                nameWrap.onclick = (e) => {
                    e.stopPropagation();
                    if (State.isSelectionModeActive) {
                        SelectionManager.toggle(fullChildItem);
                        return;
                    }
                    if (child.kind === 'directory') {
                        this.toggleDirectory(uniquePath, li, fullChildItem, depth, registerDom, options);
                    } else {
                        // B"H - Sidebar Preview Support
                        if (options.onFileClick) {
                            options.onFileClick(fullChildItem);
                        } else {
                            Tabs.create(fullChildItem);
                        }
                    }
                };

                nameWrap.oncontextmenu = (e) => {
                    State.contextEvent = e;
                    Menus.show(e, fullChildItem);
                };
                
                if (registerDom) {
                    State.domItemMap.set(uniquePath, { el: li, item: fullChildItem });
                }
                
                // Auto-Expand if state dictates
                if (State.expandedFolders.has(uniquePath)) {
                    li.classList.add('expanded');
                    const newUl = document.createElement('ul');
                    li.appendChild(newUl);
                    // Use timeout to prevent call stack overflow on deep trees
                    setTimeout(() => this.renderTree(newUl, fullChildItem, depth + 1, registerDom, options), 0);
                }
            }
            parentElement.appendChild(fragment);
        } catch (e) {
            console.error("Tree Render Error:", e);
            parentElement.innerHTML = `<li class="tree-item error">Error: ${e.message}</li>`;
        }
    },

    toggleDirectory(uniquePath, li, item, depth, registerDom, options) {
        if (State.expandedFolders.has(uniquePath)) {
            State.expandedFolders.delete(uniquePath);
            li.classList.remove('expanded');
            li.querySelector('ul')?.remove();
        } else {
            State.expandedFolders.add(uniquePath);
            li.classList.add('expanded');
            const newUl = document.createElement('ul');
            li.appendChild(newUl);
            this.renderTree(newUl, item, depth + 1, registerDom, options);
        }
        App.saveSession();
    }
};