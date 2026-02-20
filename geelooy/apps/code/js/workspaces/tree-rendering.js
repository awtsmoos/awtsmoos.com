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
    // B"H - Updated renderTree with reach-back detection
	async renderTree(parentElement, parentItem, depth, registerDom = true, options = {}) {
        parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Loading...</li>`;
        try {
            let children;
            let isParentGitRoot = false;
            const workspace = State.workspaces.find(ws => ws.id === parentItem.workspaceId);

            // 1. Fetch data from GitHub or Local
            if (parentItem.type === 'github' && workspace) {
                if (!workspace._treeCache) await FileSystemProvider.GitHub.getFullTree(parentItem);
                const lookupPath = parentItem.path === '/' ? '' : (parentItem.path.startsWith('/') ? parentItem.path.slice(1) : parentItem.path);
                children = workspace._treeCache?.get(lookupPath) || [];
                // Direct GitHub connections are always git roots at the top level
                isParentGitRoot = (parentItem.path === '/' || parentItem.path === '');
            } else {
                const result = await FileSystemProvider.list(parentItem);
                children = result.entries;
                isParentGitRoot = result.isGitRoot;
            }

            parentElement.innerHTML = '';
            if (!Array.isArray(children)) children = [];

            // 2. B"H - Update Parent Icon & Global Registry
            if (isParentGitRoot) {
                parentItem.isGitClone = true; 
                
                // Register in Global State
                const wsId = parentItem.workspaceId;
                if (!State.knownGitRoots.has(wsId)) State.knownGitRoots.set(wsId, new Set());
                State.knownGitRoots.get(wsId).add(parentItem.path || '/');

                const parentUnique = getItemUniquePath(parentItem);
                const parentEntry = State.domItemMap.get(parentUnique);
                if (parentEntry) {
                    const iconUse = parentEntry.el.querySelector('.tree-item-name-wrap .svg-icon use');
                    if (iconUse) iconUse.setAttribute('href', '#icon-git-folder');
                }
            } else {
                // Not a git root, ensure it doesn't have the icon (clears the "virus")
                parentItem.isGitClone = false;
                const parentUnique = getItemUniquePath(parentItem);
                const parentEntry = State.domItemMap.get(parentUnique);
                if (parentEntry && parentItem.path !== '/') { // Don't reset workspace root icons
                     const iconUse = parentEntry.el.querySelector('.tree-item-name-wrap .svg-icon use');
                     if (iconUse) iconUse.setAttribute('href', '#icon-folder');
                }
            }

            // 3. Filter and Sort children
            const displayChildren = children.filter(c => c && c.name !== '.gitkeep' && c.name !== '.awtsmoos-repo');
            displayChildren.sort((a, b) => (a.kind === b.kind) ? a.name.localeCompare(b.name) : (a.kind === 'directory' || a.kind === 'folder' ? -1 : 1));

            if (displayChildren.length === 0) {
                parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary); font-style: italic;">Empty</li>`;
                return;
            }

            // 4. Forge the UI elements
            const fragment = document.createDocumentFragment();
            for (const child of displayChildren) {
                // Ensure we don't accidentally pass down the clone flag to the new child object
                const fullChildItem = { ...parentItem, ...child };
                delete fullChildItem.isGitClone; 
                if (fullChildItem.handle) delete fullChildItem.handle;
                
                const uniquePath = getItemUniquePath(fullChildItem);
                const isDir = child.kind === 'directory' || child.kind === 'folder';
                
                // Subfolders start with standard icons. They only become git-folders when expanded or peeked.
                const icon = isDir ? 'folder' : 'file';
                
                const li = document.createElement('li');
                li.className = 'tree-item';
                li.style.setProperty('--depth', depth);
                li.innerHTML = `
                    <div class="tree-item-name-wrap">
                        <span class="tree-item-arrow">${isDir ? '▶' : '•'}</span>
                        <svg class="svg-icon"><use href="#icon-${icon}"/></svg>
                        <span class="tree-item-name">${child.name}</span>
                    </div>`;
                
                const nameWrap = li.querySelector('.tree-item-name-wrap');
                if (isDir) {
                    Workspaces.setupDragDrop(nameWrap, fullChildItem);
                }
                
                nameWrap.onclick = (e) => {
                    e.stopPropagation();
                    if (State.isSelectionModeActive) { SelectionManager.toggle(fullChildItem); return; }
                    if (isDir) this.toggleDirectory(uniquePath, li, fullChildItem, depth, registerDom, options);
                    else (options.onFileClick ? options.onFileClick(fullChildItem) : Tabs.create(fullChildItem));
                };

                nameWrap.oncontextmenu = (e) => { State.contextEvent = e; Menus.show(e, fullChildItem); };
                if (registerDom) State.domItemMap.set(uniquePath, { el: li, item: fullChildItem });
                
                if (State.expandedFolders.has(uniquePath)) {
                    li.classList.add('expanded');
                    const newUl = document.createElement('ul');
                    li.appendChild(newUl);
                    this.renderTree(newUl, fullChildItem, depth + 1, registerDom, options);
                }
                fragment.appendChild(li);
            }
            parentElement.appendChild(fragment);
        } catch (e) {
            console.error("Tree Render Error:", e);
            parentElement.innerHTML = `<li class="tree-item error">Error: ${e.message}</li>`;
        }
    },
	
	// B"H 
	// Helper to scan for Git metadata without full expansion

	async _peekForGit(item, nameWrapEl) {
        try {
            if (item.kind !== 'directory' && item.kind !== 'folder') return;
            const children = await FileSystemProvider.list(item);
            if (children.some(c => c.name === '.awtsmoos-repo')) {
                item.isGitClone = true;
                const iconUse = nameWrapEl.querySelector('.svg-icon use');
                if (iconUse) iconUse.setAttribute('href', '#icon-git-folder');
            } else {
                item.isGitClone = false;
            }
        } catch(e) {
            item.isGitClone = false;
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