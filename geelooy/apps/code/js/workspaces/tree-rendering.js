
// B"H
// FILE: js/workspaces/tree-rendering.js

import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Menus } from '../menus.js';
import { Tabs } from '../tabs/index.js';
import { SelectionManager } from '../selection-manager.js';
import { getItemUniquePath, Workspaces } from '../workspaces.js';

export const WorkspaceTreeRenderer = {
    
    async renderTree(parentElement, parentItem, depth, registerDom = true, options = {}) {
        if (!parentElement) return;
        if (!parentItem) {
            parentElement.innerHTML = '<li class="tree-item error">Corruption: Item Lost</li>';
            return;
        }

        const parentPath = (typeof parentItem.path === 'string') ? parentItem.path : "/";
        const wsId = parentItem.workspaceId || parentItem.id;
        
        parentElement.innerHTML = '<li class="tree-item loading-state" style="opacity: 0.5; padding-left: 15px;">...</li>';

        try {
            const result = await FileSystemProvider.list(parentItem);
            const children = (result && result.entries) ? result.entries : [];
            
            parentElement.innerHTML = '';

            if (children.length === 0) {
                const emptyLi = document.createElement('li');
                emptyLi.className = 'tree-item empty-state';
                emptyLi.style.paddingLeft = '20px';
                emptyLi.style.color = 'var(--color-text-tertiary)';
                emptyLi.style.fontStyle = 'italic';
                emptyLi.textContent = 'Empty Vessel';
                parentElement.appendChild(emptyLi);
                return;
            }

            if (result.isGitRoot) {
                const parentUniquePath = getItemUniquePath(parentItem);
                const parentEntry = State.domItemMap.get(parentUniquePath);
                if (parentEntry && parentEntry.el) {
                    const iconUse = parentEntry.el.querySelector('.tree-item-name-wrap .svg-icon use');
                    if (iconUse) iconUse.setAttribute('href', '#icon-git-folder');
                }
            }

            children.sort((a, b) => {
                const aIsDir = (a.kind === 'directory' || a.kind === 'folder');
                const bIsDir = (b.kind === 'directory' || b.kind === 'folder');
                if (aIsDir && !bIsDir) return -1;
                if (!aIsDir && bIsDir) return 1;
                return a.name.localeCompare(b.name);
            });

            const fragment = document.createDocumentFragment();
            
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (!child || !child.name) continue;

                const fullChildItem = {
                    ...parentItem, 
                    ...child,      
                    workspaceId: wsId 
                };

                const uniquePath = getItemUniquePath(fullChildItem);
                const isDir = (child.kind === 'directory' || child.kind === 'folder');
                const iconName = isDir ? 'folder' : 'file';

                const li = document.createElement('li');
                li.className = 'tree-item';
                
                // B"H - Immediate Visual Manifestation of Pre-Selected Items
                if (State.selectedItems.has(uniquePath)) {
                    li.classList.add('selected');
                }

                li.dataset.path = child.path;
                
                const nameWrap = document.createElement('div');
                nameWrap.className = 'tree-item-name-wrap';
                nameWrap.style.paddingLeft = (depth * 12) + 'px';

                nameWrap.innerHTML = `
                    <span class="tree-item-arrow">${isDir ? '▶' : '•'}</span>
                    <svg class="svg-icon"><use href="#icon-${iconName}"></use></svg>
                    <span class="tree-item-name">${child.name}</span>
                `;

                if (isDir) {
                    Workspaces.setupDragDrop(nameWrap, fullChildItem);
                }

                nameWrap.onclick = (e) => {
                    e.stopPropagation();
                    if (State.isSelectionModeActive) {
                        SelectionManager.toggle(fullChildItem);
                    } else if (isDir) {
                        this.toggleDirectory(uniquePath, li, fullChildItem, depth, registerDom, options);
                    } else {
                        if (options.onFileClick) options.onFileClick(fullChildItem);
                        else Tabs.create(fullChildItem);
                    }
                };

                nameWrap.oncontextmenu = (e) => {
                    State.contextEvent = e;
                    Menus.show(e, fullChildItem);
                };

                li.appendChild(nameWrap);

                if (registerDom) {
                    State.domItemMap.set(uniquePath, { el: li, item: fullChildItem });
                }

                if (isDir && State.expandedFolders.has(uniquePath)) {
                    li.classList.add('expanded');
                    const childUl = document.createElement('ul');
                    childUl.className = 'tree-branch';
                    li.appendChild(childUl);
                    this.renderTree(childUl, fullChildItem, depth + 1, registerDom, options);
                }

                fragment.appendChild(li);
            }

            parentElement.appendChild(fragment);

        } catch (error) {
            console.error("[Tree] Critical collapse during manifestation of:", parentPath, error);
            parentElement.innerHTML = `<li class="tree-item error-node" style="color:var(--color-accent-danger); font-size:0.8em; padding-left:15px;">
                Error: ${error.message}
            </li>`;
        }
    },

    toggleDirectory(uniquePath, liElement, item, depth, registerDom, options) {
        if (!liElement) return;

        if (State.expandedFolders.has(uniquePath)) {
            State.expandedFolders.delete(uniquePath);
            liElement.classList.remove('expanded');
            const existingUl = liElement.querySelector('ul');
            if (existingUl) existingUl.remove();
        } else {
            State.expandedFolders.add(uniquePath);
            liElement.classList.add('expanded');
            const newUl = document.createElement('ul');
            newUl.className = 'tree-branch';
            liElement.appendChild(newUl);
            this.renderTree(newUl, item, depth + 1, registerDom, options);
        }
        
        import('../app.js').then(m => m.App.saveSession());
    }
};
