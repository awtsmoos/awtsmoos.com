// B"H
// FILE: js/workspaces/tree-rendering.js

import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Menus } from '../menus.js';
import { Tabs } from '../tabs/index.js';
import { SelectionManager } from '../selection-manager.js';
import { getItemUniquePath, Workspaces } from '../workspaces.js';

/**
 * --- WORKSPACE TREE RENDERER (ULTIMATE EDITION) ---
 * The sacred engine responsible for manifesting the physical hierarchy 
 * of the project vessels. B"H.
 */
export const WorkspaceTreeRenderer = {
    
    /**
     * B"H - The Primary Rendering Ritual.
     * Rewritten to be completely defensive against path/type mismatches.
     */
    async renderTree(parentElement, parentItem, depth, registerDom = true, options = {}) {
        // 1. FUNDAMENTAL VALIDATION
        if (!parentElement) {
            console.error("[Tree] Manifestation failed: parentElement is null.");
            return;
        }
        if (!parentItem) {
            console.error("[Tree] Manifestation failed: parentItem is null.");
            parentElement.innerHTML = '<li class="tree-item error">Corruption: Item Lost</li>';
            return;
        }

        // 2. PATH STABILIZATION
        // We ensure path is never undefined before any logic occurs.
        const parentPath = (typeof parentItem.path === 'string') ? parentItem.path : "/";
        const wsId = parentItem.workspaceId || parentItem.id;
        
        // Visual feedback during the stabilization phase
        parentElement.innerHTML = '<li class="tree-item loading-state" style="opacity: 0.5; padding-left: 15px;">...</li>';

        try {
            // 3. PEERING INTO THE VESSELS (Data Retrieval)
            const result = await FileSystemProvider.list(parentItem);
            const children = (result && result.entries) ? result.entries : [];
            
            // Clear the loading indicator
            parentElement.innerHTML = '';

            // 4. HANDLING VACUITY
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

            // 5. METADATA SYNCHRONIZATION (Git Detection)
            if (result.isGitRoot) {
                const parentUniquePath = getItemUniquePath(parentItem);
                const parentEntry = State.domItemMap.get(parentUniquePath);
                if (parentEntry && parentEntry.el) {
                    const iconUse = parentEntry.el.querySelector('.tree-item-name-wrap .svg-icon use');
                    if (iconUse) iconUse.setAttribute('href', '#icon-git-folder');
                }
            }

            // 6. ORDERING THE ESSENCE (Sorting)
            // Directories always precede files, then alphabetical.
            children.sort((a, b) => {
                const aIsDir = (a.kind === 'directory' || a.kind === 'folder');
                const bIsDir = (b.kind === 'directory' || b.kind === 'folder');
                if (aIsDir && !bIsDir) return -1;
                if (!aIsDir && bIsDir) return 1;
                return a.name.localeCompare(b.name);
            });

            // 7. PHYSICAL MANIFESTATION (DOM Construction)
            const fragment = document.createDocumentFragment();
            
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (!child || !child.name) continue;

                // Forge the child's identity
                // B"H - Ensuring absolute inheritance of Workspace ID
                const fullChildItem = {
                    ...parentItem, // Inherit workspace properties
                    ...child,      // Apply specific file properties
                    workspaceId: wsId // Force the ID for absolute clarity
                };

                const uniquePath = getItemUniquePath(fullChildItem);
                const isDir = (child.kind === 'directory' || child.kind === 'folder');
                const iconName = isDir ? 'folder' : 'file';

                const li = document.createElement('li');
                li.className = 'tree-item';
                li.dataset.path = child.path;
                
                // Create the visible wrapper
                const nameWrap = document.createElement('div');
                nameWrap.className = 'tree-item-name-wrap';
                
                // Indentation logic based on depth
                nameWrap.style.paddingLeft = (depth * 12) + 'px';

                nameWrap.innerHTML = `
                    <span class="tree-item-arrow">${isDir ? '▶' : '•'}</span>
                    <svg class="svg-icon"><use href="#icon-${iconName}"></use></svg>
                    <span class="tree-item-name">${child.name}</span>
                `;

                // Bind interactivity
                if (isDir) {
                    // Set up drag/drop for folders
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

                // Register in the Divine Mapping for external access (like "Show in Explorer")
                if (registerDom) {
                    State.domItemMap.set(uniquePath, { el: li, item: fullChildItem });
                }

                // 8. PERSISTENCE CHECK (Auto-Expansion)
                // If this folder was already open in the user's mind (State), re-manifest its children.
                if (isDir && State.expandedFolders.has(uniquePath)) {
                    li.classList.add('expanded');
                    const childUl = document.createElement('ul');
                    childUl.className = 'tree-branch';
                    li.appendChild(childUl);
                    // Divine Recursion
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

    /**
     * B"H - The ritual of opening and closing directories.
     * Fully rewritten to ensure state consistency.
     */
    toggleDirectory(uniquePath, liElement, item, depth, registerDom, options) {
        if (!liElement) return;

        if (State.expandedFolders.has(uniquePath)) {
            // Collapse sequence
            State.expandedFolders.delete(uniquePath);
            liElement.classList.remove('expanded');
            
            // Purge the physical children from the DOM
            const existingUl = liElement.querySelector('ul');
            if (existingUl) existingUl.remove();
        } else {
            // Expansion sequence
            State.expandedFolders.add(uniquePath);
            liElement.classList.add('expanded');
            
            // Create the container for children
            const newUl = document.createElement('ul');
            newUl.className = 'tree-branch';
            liElement.appendChild(newUl);
            
            // Trigger the Manifestation Ritual for the next layer
            this.renderTree(newUl, item, depth + 1, registerDom, options);
        }
        
        // Archive this change in the session memory
        import('../app.js').then(m => m.App.saveSession());
    }
};