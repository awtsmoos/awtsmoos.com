
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
            
            if (!Array.isArray(children)) children = [];
            
            children.sort((a, b) => (a.kind === b.kind) ? a.name.localeCompare(b.name) : (a.kind === 'directory' ? -1 : 1));

            if (children.length === 0) {
                parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary); font-style: italic;">Empty</li>`;
                return;
            }

            const fragment = document.createDocumentFragment();

            // B"H - Loop protection: Iterate with index to ensure completion
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                try {
                    if (!child || child.name === '.gitkeep') continue;
                    
                    const fullChildItem = { ...parentItem, ...child };
                    // Remove handle from child to prevent stale reference propagation
                    if (fullChildItem.handle) delete fullChildItem.handle;
                    
                    // B"H - CRITICAL FIX: Stop inheritance of isGitClone.
                    // Subfolders are not git roots just because their parent is.
                    delete fullChildItem.isGitClone;
                    
                    const uniquePath = getItemUniquePath(fullChildItem);
                    
                    const isRepo = fullChildItem.isGitClone; // Should be undefined/false now
                    const icon = isRepo ? 'git-folder' : (child.kind === 'directory' ? 'folder' : 'file');
                    
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
                    
                    if (child.kind === 'directory') {
                        Workspaces.setupDragDrop(nameWrap, fullChildItem);
                    }

                    nameWrap.onclick = (e) => {
                        e.stopPropagation();
                        if (State.isSelectionModeActive) {
                            SelectionManager.toggle(fullChildItem);
                            return;
                        }
                        if (child.kind === 'directory') {
                            if (State.expandedFolders.has(uniquePath)) {
                                State.expandedFolders.delete(uniquePath);
                                li.classList.remove('expanded');
                                li.querySelector('ul')?.remove();
                            } else {
                                State.expandedFolders.add(uniquePath);
                                li.classList.add('expanded');
                                const newUl = document.createElement('ul');
                                li.appendChild(newUl);
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
                    
                    if (registerDom) {
                        State.domItemMap.set(uniquePath, {
                            el: li,
                            item: fullChildItem
                        });
                    }
                    
                    if (State.expandedFolders.has(uniquePath)) {
                        li.classList.add('expanded');
                        const newUl = document.createElement('ul');
                        li.appendChild(newUl);
                        // Using setTimeout to break call stack and ensure UI responsiveness
                        setTimeout(() => {
                             this.renderTree(newUl, fullChildItem, depth + 1, registerDom).catch(e => console.error(e));
                        }, 0);
                    }
                } catch (itemError) {
                    console.error("Error rendering tree item:", child.name, itemError);
                    const errorLi = document.createElement('li');
                    errorLi.className = 'tree-item';
                    errorLi.style.setProperty('--depth', depth);
                    errorLi.style.color = 'var(--color-accent-danger)';
                    errorLi.textContent = `Error: ${child.name}`;
                    fragment.appendChild(errorLi);
                }
            }
            
            parentElement.appendChild(fragment);
            
        } catch (e) {
            console.error("Error rendering tree:", e);
            parentElement.innerHTML = `<li class="tree-item" style="color: var(--color-accent-danger); --depth:${depth};">Error: ${e.message}</li>`;
        }
    }
};
