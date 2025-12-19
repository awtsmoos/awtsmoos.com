
// B"H
// FILE: js/workspaces/tree-rendering.js

import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { GitMetaProvider } from '../git/meta.js';
import { GitManager } from '../git/index.js';
import { Menus } from '../menus.js';
import { Tabs } from '../tabs.js';
import { App } from '../app.js';
import { SelectionManager } from '../selection-manager.js';
import { getItemUniquePath, Workspaces } from '../workspaces.js';

export const WorkspaceTreeRenderer = {
    /**
     * B"H - renderTree
     * @param {HTMLElement} parentElement - Container UL
     * @param {Object} parentItem - Directory Item
     * @param {Number} depth - Indentation depth
     * @param {Boolean} registerDom - (Default true) If false, skips updating State.domItemMap.
     *                                Use false for Vibe/secondary views to avoid hijacking the Main Explorer's scroll references.
     */
    async renderTree(parentElement, parentItem, depth, registerDom = true) {
        parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Loading...</li>`;
        try {
            let children;
            const workspace = State.workspaces.find(ws => ws.id === parentItem.workspaceId);

            if (parentItem.type === 'github' && workspace) {
                if (!workspace._treeCache) {
                    parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Building repository map...</li>`;
                    const fullTreeData = await FileSystemProvider.GitHub.getFullTree(parentItem);
                    
                    const cache = new Map();
                    if (fullTreeData.tree) {
                        fullTreeData.tree.forEach(node => {
                            const pathParts = node.path.split('/');
                            pathParts.pop(); 
                            let parentPath = pathParts.join('/');
                            if (!cache.has(parentPath)) {
                                cache.set(parentPath, []);
                            }
                        });
                        fullTreeData.tree.forEach(node => {
                            const pathParts = node.path.split('/');
                            const name = pathParts.pop();
                            const parentPath = pathParts.join('/');
                            
                            cache.get(parentPath).push({
                               name: name,
                               kind: node.type === 'tree' ? 'directory' : 'file',
                               path: node.path,
                               sha: node.sha 
                            });
                        });
                    }
                    workspace._treeCache = cache;
                }
                const lookupPath = parentItem.path === '/' ? '' : parentItem.path;
                children = workspace._treeCache.get(lookupPath) || [];
            } else {
                children = await FileSystemProvider.list(parentItem);
            }

            parentElement.innerHTML = '';
            children.sort((a, b) => (a.kind === b.kind) ? a.name.localeCompare(b.name) : (a.kind === 'directory' ? -1 : 1));

            if (children.length === 0) {
                parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary); font-style: italic;">Empty</li>`;
                return;
            }

            for (const child of children) {
                if (child.name === '.gitkeep') continue;
                const fullChildItem = { ...parentItem, ...child };
                const uniquePath = getItemUniquePath(fullChildItem);
                const gitInfo = child.kind === 'directory' ? await GitMetaProvider.getGitInfoForFolder(fullChildItem) : null;
                fullChildItem.isGitClone = !!gitInfo;
                const icon = fullChildItem.isGitClone ? 'git-folder' : (child.kind === 'directory' ? 'folder' : 'file');
                const li = document.createElement('li');
                li.className = 'tree-item';
                li.style.setProperty('--depth', depth);
                li.innerHTML = `
                    <div class="tree-item-name-wrap">
                        <span class="tree-item-arrow">${child.kind === 'directory' ? '▶' : '•'}</span>
                        <svg class="svg-icon"><use href="#icon-${icon}"/></svg>
                        <span class="tree-item-name">${child.name}</span>
                    </div>`;
                parentElement.appendChild(li);
                const nameWrap = li.querySelector('.tree-item-name-wrap');
                
                // B"H - Attach DnD to Folder Items
                if (child.kind === 'directory') {
                    Workspaces.setupDragDrop(nameWrap, fullChildItem);
                }

                if (fullChildItem.isGitClone) {
                    const gitBtn = document.createElement('button');
                    gitBtn.className = 'icon-button git-actions-btn';
                    gitBtn.title = 'Git Actions';
                    gitBtn.innerHTML = `<svg class="svg-icon"><use href="#icon-git-branch"></use></svg>`;
                    gitBtn.onclick = (e) => {
                        e.stopPropagation();
                        GitManager.showGitUI(fullChildItem);
                    };
                    nameWrap.appendChild(gitBtn);
                }
                nameWrap.onclick = (e) => {
                    e.stopPropagation();
                    if (State.isSelectionModeActive) {
                        SelectionManager.toggle(fullChildItem);
                        return;
                    }
                    if (child.kind === 'directory') {
                        // Vibe Panel Expansion: Since we don't register DOM, we must check local state or assume simple toggle.
                        // However, `State.expandedFolders` is global. 
                        // If user expands in Vibe, it expands in Main Explorer too. This is desired "sense of folder structure".
                        
                        if (State.expandedFolders.has(uniquePath)) {
                            State.expandedFolders.delete(uniquePath);
                            li.classList.remove('expanded');
                            li.querySelector('ul')?.remove();
                        } else {
                            State.expandedFolders.add(uniquePath);
                            li.classList.add('expanded');
                            const newUl = document.createElement('ul');
                            li.appendChild(newUl);
                            // Pass registerDom flag recursively
                            // B"H - CRITICAL FIX: Await recursion to ensure Reveal works
                            this.renderTree(newUl, fullChildItem, depth + 1, registerDom);
                        }
                        App.saveSession();
                    } else {
                        Tabs.create(fullChildItem);
                    }
                };
                nameWrap.oncontextmenu = (e) => {
                    State.contextEvent = e;
                    Menus.show(e, fullChildItem);
                };
                
                // B"H - DOM Registration Conditional
                if (registerDom) {
                    State.domItemMap.set(uniquePath, {
                        el: li,
                        item: fullChildItem
                    });
                }
                
                // Render already expanded folders
                if (State.expandedFolders.has(uniquePath)) {
                    li.classList.add('expanded');
                    const newUl = document.createElement('ul');
                    li.appendChild(newUl);
                    // B"H - CRITICAL FIX: Await recursion to ensure Reveal works
                    await this.renderTree(newUl, fullChildItem, depth + 1, registerDom);
                }
            }
        } catch (e) {
            console.error("Error rendering tree:", e);
            parentElement.innerHTML = `<li class="tree-item" style="color: var(--color-accent-danger); --depth:${depth};">Error: ${e.message}</li>`;
        }
    }
};
