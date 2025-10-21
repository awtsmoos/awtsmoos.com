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
    // --- B"H FIX 1 ---
    // Instead of re-rendering everything, this function now appends a new workspace
    // without disturbing the existing ones.
    add(ws) {
        // If the "Add a workspace" message is present, remove it first.
        const emptyMessage = DOM.workspacesContainer.querySelector('div[style*="padding: 20px"]');
        if (emptyMessage) {
            DOM.workspacesContainer.innerHTML = '';
        }

        const newWs = { id: State.nextWorkspaceId++, isCollapsed: false, ...ws };
        State.workspaces.push(newWs);
        
        // Render just the new workspace and append it to the container.
        this.renderWorkspace(newWs, DOM.workspacesContainer);
    },

    // This is the main render function, now refactored to use the helper below.
    render() {
        DOM.workspacesContainer.innerHTML = '';
        State.domItemMap.clear();
        if (State.workspaces.length === 0) {
            DOM.workspacesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--color-text-secondary);">Add a workspace to begin.</div>`;
            return;
        }

        State.workspaces.forEach(ws => {
            this.renderWorkspace(ws, DOM.workspacesContainer);
        });
    },

    // This is a new helper function that renders a single workspace.
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
            ws.isCollapsed = !ws.isCollapsed;
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
    
    // --- B"H FIX 2 ---
    // This function is now smarter. If a folder is collapsed, it will programmatically
    // expand it before refreshing, ensuring the new item is visible.
    async refreshNode(item) {
        const workspaceId = item.workspaceId ?? item.id;
        const path = item.path ?? '/';
        const mapKey = `${workspaceId}::${path}`;

        const entry = State.domItemMap.get(mapKey);
        if (!entry) {
            console.error("refreshNode could not find entry for key:", mapKey);
            return;
        }

        const directoryElement = entry.el;
        const directoryItem = entry.item;
        const isRoot = directoryElement.classList.contains('workspace-root');

        let childrenContainer = directoryElement.querySelector('ul');

        if (!childrenContainer) {
            // If the container doesn't exist, the directory is collapsed.
            // We need to expand it to show the new item by simulating a click.
            if (isRoot) {
                const header = directoryElement.querySelector('.workspace-header');
                if (header) header.click();
            } else {
                const nameWrap = directoryElement.querySelector('.tree-item-name-wrap');
                if (nameWrap) nameWrap.click();
            }
        } else {
            // If the container *does* exist, the directory is already expanded.
            // We just need to re-render its contents.
            const childrenDepth = isRoot ? 1 : (directoryItem.path.match(/\//g) || []).length + 1;
            await this.renderTree(childrenContainer, directoryItem, childrenDepth);
        }
    }
};