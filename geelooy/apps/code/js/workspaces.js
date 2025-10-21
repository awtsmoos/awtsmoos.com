// B"H
// FILE: js/workspaces.js

import { State, DOM } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs.js';
import { Menus } from './menus.js';

/**
 * Workspaces Module: Manages the file explorer tree view.
 */
export const Workspaces = {
    // --- B"H FIX 1: ADDING A NEW WORKSPACE ---
    // This is now the permanent, correct logic. It surgically adds the new
    // workspace to the DOM, preserving the expanded/collapsed state of all others.
    add(ws) {
        const emptyMessage = DOM.workspacesContainer.querySelector('div[style*="padding: 20px"]');
        if (emptyMessage) {
            DOM.workspacesContainer.innerHTML = '';
        }

        const newWs = { id: State.nextWorkspaceId++, isCollapsed: false, ...ws };
        State.workspaces.push(newWs);
        
        // Render just the new workspace and append it directly.
        this.renderWorkspace(newWs, DOM.workspacesContainer);
    },

    // Main render function for initial page load.
    render() {
        DOM.workspacesContainer.innerHTML = '';
        State.domItemMap.clear();
        if (State.workspaces.length === 0) {
            DOM.workspacesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--color-text-secondary);">Add a workspace to begin.</div>`;
            return;
        }
        State.workspaces.forEach(ws => this.renderWorkspace(ws, DOM.workspacesContainer));
    },

    // Helper to render a single workspace. This is used by both add() and render().
    renderWorkspace(ws, container) {
        const wsRoot = document.createElement('div');
        wsRoot.className = 'workspace-root';
        
        const iconMap = { local: 'laptop', github: 'github', indexeddb: 'brain' };
        wsRoot.innerHTML = `
            <div class="workspace-header">
                <strong><svg class="svg-icon" style="margin-right:8px;"><use href="#icon-${iconMap[ws.type]}"></use></svg>${ws.name}</strong>
            </div>
            <ul class="workspace-tree ${ws.isCollapsed ? 'hidden' : ''}"></ul>`;
        
        const header = wsRoot.querySelector('.workspace-header');
        const tree = wsRoot.querySelector('.workspace-tree');
        
        header.onclick = () => {
            ws.isCollapsed = !ws.isCollapsed; // This directly modifies the object in the State array
            tree.classList.toggle('hidden', ws.isCollapsed);
            if (!ws.isCollapsed && !tree.hasChildNodes()) {
                this.renderTree(tree, { ...ws, path: '/', workspaceId: ws.id, kind: 'directory' }, 1);
            }
        };
        header.oncontextmenu = (e) => Menus.show(e, { ...ws, path: '/', kind: 'directory' });

        container.appendChild(wsRoot);
        const rootItem = { ...ws, path: '/', workspaceId: ws.id };
        State.domItemMap.set(`${ws.id}::/`, { el: wsRoot, item: rootItem });
        if (!ws.isCollapsed) {
           this.renderTree(tree, { ...rootItem, kind: 'directory' }, 1);
        }
    },

    async renderTree(parentElement, parentItem, depth) {
        parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Loading...</li>`;
        try {
            const children = await FileSystemProvider.list(parentItem);
            
            parentElement.innerHTML = '';
            children.sort((a, b) => (a.kind === b.kind) ? a.name.localeCompare(b.name) : (a.kind === 'directory' ? -1 : 1));
            
            if (children.length === 0) {
                parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary); font-style: italic;">Empty</li>`;
                return;
            }

            children.forEach(child => {
                const li = document.createElement('li');
                li.className = 'tree-item';
                li.style.setProperty('--depth', depth);
                
                const workspace = State.workspaces.find(ws => ws.id === parentItem.workspaceId);
                const fullChildItem = { ...workspace, ...child, workspaceId: workspace.id };
                li.title = fullChildItem.path;
                State.domItemMap.set(`${workspace.id}::${child.path}`, { el: li, item: fullChildItem });

                const icon = child.kind === 'directory' ? 'folder' : 'file';
                const arrow = child.kind === 'directory' ? `<span class="tree-item-arrow">▶</span>` : `<span class="tree-item-arrow" style="opacity:0;">•</span>`;

                li.innerHTML = `
                    <div class="tree-item-name-wrap">
                        ${arrow}
                        <svg class="svg-icon" style="flex-shrink:0; margin-right:2px;"><use href="#icon-${icon}"/></svg>
                        <span class="tree-item-name">${child.name}</span>
                    </div>`;
                
                const nameWrap = li.querySelector('.tree-item-name-wrap');
                nameWrap.onclick = (e) => {
                    e.stopPropagation();
                    if (child.kind === 'directory') {
                        const subList = li.querySelector('ul');
                        if (subList) { 
                            subList.remove(); li.classList.remove('expanded');
                        } else {
                            li.classList.add('expanded');
                            const newUl = document.createElement('ul');
                            li.appendChild(newUl);
                            this.renderTree(newUl, fullChildItem, depth + 1);
                        }
                    } else { Tabs.create(fullChildItem); }
                };
                li.oncontextmenu = (e) => Menus.show(e, fullChildItem);
                parentElement.appendChild(li);
            });
        } catch (e) {
            parentElement.innerHTML = `<li class="tree-item" style="color: var(--color-accent-danger); --depth:${depth};">Error: ${e.message}</li>`;
        }
    },
    
    // --- B"H FIX 2: CREATING A NEW FOLDER/FILE ---
    // This new logic is robust. It checks if a folder is expanded. If not,
    // it FORCES it to expand by directly changing its state and DOM before refreshing.
    async refreshNode(item) {
        const workspaceId = item.workspaceId ?? item.id;
        const path = item.path ?? '/';
        const mapKey = `${workspaceId}::${path}`;

        const entry = State.domItemMap.get(mapKey);
        if (!entry) { return; }

        const directoryElement = entry.el;
        const directoryItem = entry.item;
        const isRoot = directoryElement.classList.contains('workspace-root');

        let childrenContainer = directoryElement.querySelector('ul');
        const isCollapsed = !childrenContainer || childrenContainer.classList.contains('hidden');

        if (isCollapsed) {
            // Find the state object for the workspace/folder and force it to be expanded
            if (isRoot) {
                const workspaceState = State.workspaces.find(ws => ws.id === directoryItem.id);
                if (workspaceState) workspaceState.isCollapsed = false;
            }
            // For subfolders, the expanded/collapsed state is managed by the DOM class, not a state property.
            
            // Un-hide the container if it exists but is hidden
            if (childrenContainer) {
                childrenContainer.classList.remove('hidden');
            } else {
                // If it doesn't exist at all, create it.
                childrenContainer = document.createElement('ul');
                childrenContainer.className = 'workspace-tree';
                directoryElement.appendChild(childrenContainer);
            }

            // Visually update the UI to match the new expanded state
            if (isRoot) {
                const workspaceState = State.workspaces.find(ws => ws.id === workspaceId);
                if (workspaceState) workspaceState.isCollapsed = false;
            } else {
                directoryElement.classList.add('expanded');
            }
        }
        
        // Now that the children container is guaranteed to be visible, refresh its content.
        const childrenDepth = isRoot ? 1 : (directoryItem.path.match(/\//g) || []).length + 1;
        await this.renderTree(childrenContainer, directoryItem, childrenDepth);
    }
};