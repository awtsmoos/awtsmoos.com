// B"H
// FILE: js/workspaces.js

import { State , DOM} from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs.js';
import { Menus } from './menus.js';
import { App } from './app.js';

const getItemUniquePath = (item) => `${item.workspaceId ?? item.id}::${item.path ?? '/'}`;

export const Workspaces = {
    add(ws, shouldSave = true) {
        const emptyMessage = DOM.workspacesContainer.querySelector('div[style*="padding: 20px"]');
        if (emptyMessage) {
            DOM.workspacesContainer.innerHTML = '';
        }
        
        const isNew = ws.id === undefined;
        const newWs = { id: isNew ? State.nextWorkspaceId++ : ws.id, ...ws };
        
        State.workspaces.push(newWs);
        
        if (shouldSave) {
            this.renderWorkspace(newWs, DOM.workspacesContainer);
            App.saveSession();
        }
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
        if (isExpanded) wsRoot.classList.add('expanded');

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
                wsRoot.classList.remove('expanded');
                wsRoot.querySelector('ul')?.remove();
            } else {
                State.expandedFolders.add(uniquePath);
                wsRoot.classList.add('expanded');
                const tree = document.createElement('ul');
                tree.className = 'workspace-tree';
                wsRoot.appendChild(tree);
                this.renderTree(tree, { ...ws, path: '/', workspaceId: ws.id, kind: 'directory' }, 1);
            }
            App.saveSession();
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
                
                const parentWorkspaceId = parentItem.workspaceId ?? parentItem.id;
                const workspace = State.workspaces.find(ws => ws.id === parentWorkspaceId);
                if (!workspace) return;

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
                        App.saveSession();
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
            console.error("Error rendering tree:", e);
            parentElement.innerHTML = `<li class="tree-item" style="color: var(--color-accent-danger); --depth:${depth};">Error: ${e.message}</li>`;
        }
    },
    
    async refreshNode(item) {
        const uniquePath = getItemUniquePath(item);
        const entry = State.domItemMap.get(uniquePath);
        if (!entry) return;

        const directoryElement = entry.el;
        
        if (State.expandedFolders.has(uniquePath)) {
            directoryElement.classList.add('expanded');
            let childrenContainer = directoryElement.querySelector('ul');
            if (!childrenContainer) {
                childrenContainer = document.createElement('ul');
                const isRoot = directoryElement.classList.contains('workspace-root');
                if (isRoot) childrenContainer.className = 'workspace-tree';
                directoryElement.appendChild(childrenContainer);
            }
            
            const isRoot = directoryElement.classList.contains('workspace-root');
            const depth = isRoot ? 1 : (item.path.match(/\//g) || []).length + 1;
            await this.renderTree(childrenContainer, item, depth);
        }
    }
};