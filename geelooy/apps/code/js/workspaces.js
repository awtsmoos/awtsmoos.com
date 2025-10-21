// B"H
// FILE: js/workspaces.js

import { State, DOM } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs.js';
import { Menus } from './menus.js';

// Helper function to get a consistent unique ID for any workspace item
const getItemUniquePath = (item) => `${item.workspaceId ?? item.id}::${item.path ?? '/'}`;

/**
 * Workspaces Module: Manages the file explorer tree view.
 */
export const Workspaces = {
    add(ws) {
        const emptyMessage = DOM.workspacesContainer.querySelector('div[style*="padding: 20px"]');
        if (emptyMessage) {
            DOM.workspacesContainer.innerHTML = '';
        }
        const newWs = { id: State.nextWorkspaceId++, ...ws };
        State.workspaces.push(newWs);
        this.renderWorkspace(newWs, DOM.workspacesContainer);
    },

    render() {
        DOM.workspacesContainer.innerHTML = '';
        State.domItemMap.clear();
        if (State.workspaces.length === 0) {
            DOM.workspacesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--color-text-secondary);">Add a workspace to begin.</div>`;
            return;
        }
        State.workspaces.forEach(ws => this.renderWorkspace(ws, DOM.workspacesContainer));
    },

    renderWorkspace(ws, container) {
        const wsRoot = document.createElement('div');
        wsRoot.className = 'workspace-root';
        const uniquePath = getItemUniquePath(ws);
        const isExpanded = State.expandedFolders.has(uniquePath);

        wsRoot.innerHTML = `
            <div class="workspace-header">
                <strong><svg class="svg-icon"><use href="#icon-${ws.type === 'local' ? 'laptop' : ws.type === 'github' ? 'github' : 'brain'}"></use></svg>${ws.name}</strong>
            </div>
        `;
        
        container.appendChild(wsRoot);
        const header = wsRoot.querySelector('.workspace-header');
        
        header.onclick = () => {
            if (State.expandedFolders.has(uniquePath)) {
                State.expandedFolders.delete(uniquePath);
                wsRoot.querySelector('ul')?.remove();
            } else {
                State.expandedFolders.add(uniquePath);
                const tree = document.createElement('ul');
                tree.className = 'workspace-tree';
                wsRoot.appendChild(tree);
                this.renderTree(tree, { ...ws, path: '/', workspaceId: ws.id, kind: 'directory' }, 1);
            }
        };

        header.oncontextmenu = (e) => Menus.show(e, { ...ws, path: '/', kind: 'directory' });
        
        const rootItem = { ...ws, path: '/', workspaceId: ws.id };
        State.domItemMap.set(uniquePath, { el: wsRoot, item: rootItem });

        if (isExpanded) {
           const tree = document.createElement('ul');
           tree.className = 'workspace-tree';
           wsRoot.appendChild(tree);
           this.renderTree(tree, rootItem, 1);
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
                if (child.name === '.gitkeep') return;

                const li = document.createElement('li');
                li.className = 'tree-item';
                li.style.setProperty('--depth', depth);
                
                const workspace = State.workspaces.find(ws => ws.id === parentItem.workspaceId);
                const fullChildItem = { ...workspace, ...child, workspaceId: workspace.id };
                const uniquePath = getItemUniquePath(fullChildItem);
                
                const isExpanded = State.expandedFolders.has(uniquePath);
                if (isExpanded) li.classList.add('expanded');

                li.innerHTML = `
                    <div class="tree-item-name-wrap">
                        <span class="tree-item-arrow">${child.kind === 'directory' ? '▶' : '•'}</span>
                        <svg class="svg-icon"><use href="#icon-${child.kind === 'directory' ? 'folder' : 'file'}"/></svg>
                        <span class="tree-item-name">${child.name}</span>
                    </div>`;
                
                parentElement.appendChild(li);
                const nameWrap = li.querySelector('.tree-item-name-wrap');

                nameWrap.onclick = (e) => {
                    e.stopPropagation();
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
                            this.renderTree(newUl, fullChildItem, depth + 1);
                        }
                    } else {
                        Tabs.create(fullChildItem);
                    }
                };

                nameWrap.oncontextmenu = (e) => Menus.show(e, fullChildItem);
                State.domItemMap.set(uniquePath, { el: li, item: fullChildItem });

                if (isExpanded) {
                    const newUl = document.createElement('ul');
                    li.appendChild(newUl);
                    this.renderTree(newUl, fullChildItem, depth + 1);
                }
            });
        } catch (e) {
            parentElement.innerHTML = `<li class="tree-item" style="color: var(--color-accent-danger); --depth:${depth};">Error: ${e.message}</li>`;
        }
    },
    
    // --- B"H: FINAL, ROBUST REFRESH LOGIC ---
    async refreshNode(item) {
        const uniquePath = getItemUniquePath(item);
        const entry = State.domItemMap.get(uniquePath);
        if (!entry) return;

        const directoryElement = entry.el;
        const isRoot = directoryElement.classList.contains('workspace-root');
        
        // Find the container for the children.
        let childrenContainer = directoryElement.querySelector('ul');

        // This is the key: if the folder is supposed to be expanded but has no <ul>,
        // it means the DOM is out of sync. We create it now.
        if (State.expandedFolders.has(uniquePath) && !childrenContainer) {
             childrenContainer = document.createElement('ul');
             if (isRoot) childrenContainer.className = 'workspace-tree';
             directoryElement.appendChild(childrenContainer);
             directoryElement.classList.add('expanded'); // Ensure visual state is correct
        }

        // Only proceed to render if the container exists (i.e., the folder is expanded).
        if (childrenContainer) {
            const depth = isRoot ? 1 : (item.path.match(/\//g) || []).length + 1;
            await this.renderTree(childrenContainer, item, depth);
        }
    }
};