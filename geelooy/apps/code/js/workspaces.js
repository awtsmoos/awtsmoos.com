// B"H
// FILE: js/workspaces.js
// B"H - IN: js/workspaces.js
import { SelectionManager } from './selection-manager.js';
import { State , DOM} from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs.js';
import { Menus } from './menus.js';
import { App } from './app.js';
import { GitManager } from './git-manager.js'; // Make sure this import exists
import { GitMetaProvider } from './git-meta-provider.js'; // <-- Make sure this import exists at the top



export const getItemUniquePath = (item) => `${item.workspaceId ?? item.id}::${item.path ?? '/'}`;
export const Workspaces = {
    // In workspaces.js, replace the entire add method



    render() {
        DOM.workspacesContainer.innerHTML = '';
        State.domItemMap.clear();
        if (State.workspaces.length === 0) {
            DOM.workspacesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--color-text-secondary);">Add a workspace to begin.</div>`;
            return;
        }
        State.workspaces.forEach(ws => this.renderWorkspace(ws, DOM.workspacesContainer));
    },

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

        const icon = ws.isClone ? 'git-folder' : 
                     ws.type === 'local' ? 'laptop' : 
                     ws.type === 'github' ? 'github' : 'brain';

        wsRoot.innerHTML = /*html*/ `
            <div class="workspace-header">
                <div class="workspace-header-title">
                    <strong>
                        <svg class="svg-icon"><use href="#icon-${icon}"></use></svg>
                        ${ws.name}
                    </strong>
                </div>
                <div class="workspace-header-actions">
                    ${ws.isClone ? `<button class="icon-button git-actions-btn" title="Git Actions"><svg class="svg-icon"><use href="#icon-git-branch"></use></svg></button>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(wsRoot);
        const header = wsRoot.querySelector('.workspace-header');
        const headerTitle = header.querySelector('.workspace-header-title');

        headerTitle.onclick = () => {
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
        
        const gitBtn = header.querySelector('.git-actions-btn');
        if (gitBtn) {
            gitBtn.onclick = (e) => {
                e.stopPropagation();
                GitManager.showGitUI(ws);
            };
        }
        
        const rootItem = { ...ws, path: '/', workspaceId: ws.id };
        State.domItemMap.set(uniquePath, { el: wsRoot, item: rootItem });

        if (isExpanded) {
           const tree = document.createElement('ul');
           tree.className = 'workspace-tree';
           wsRoot.appendChild(tree);
           this.renderTree(tree, rootItem, 1);
        }
    },
    


    

// REPLACE your existing renderTree function with this complete one.
async renderTree(parentElement, parentItem, depth) {
    // 1. Initial setup and fetch children
    parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Loading...</li>`;
    try {
        const children = await FileSystemProvider.list(parentItem);
        parentElement.innerHTML = ''; // Clear "Loading..." message
        children.sort((a, b) => (a.kind === b.kind) ? a.name.localeCompare(b.name) : (a.kind === 'directory' ? -1 : 1));
        
        if (children.length === 0) {
            parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary); font-style: italic;">Empty</li>`;
            return;
        }

        // 2. Process all children asynchronously and wait for them to finish
        await Promise.all(children.map(async (child) => {
            // Skip special directories we don't want to display
            if (child.name === '.gitkeep'
            // || child.name === '.awtsmoos-repo'
             ) {
                return;
            }

            // 3. Prepare item data
            const parentWorkspaceId = parentItem.workspaceId ?? parentItem.id;
            const workspace = State.workspaces.find(ws => ws.id === parentWorkspaceId);
            if (!workspace) {
                console.error("Could not find parent workspace for item:", child);
                return;
            }
            const fullChildItem = { ...workspace, ...child, workspaceId: workspace.id };
            const uniquePath = getItemUniquePath(fullChildItem);
            
            // 4. Asynchronously check if this folder is a Git clone by looking for ikar.js
            const gitInfo = child.kind === 'directory' 
                ? await GitMetaProvider.getGitInfoForFolder(fullChildItem) 
                : null;
            const isGitClone = !!gitInfo;

            // 5. Determine the correct icon
            let icon = child.kind === 'directory' ? 'folder' : 'file';
            if (isGitClone) {
                icon = 'git-branch'; // Use a Git icon for the folder
            }

            // 6. Create the HTML for the list item
            const li = document.createElement('li');
            li.className = 'tree-item';
            li.style.setProperty('--depth', depth);
            li.innerHTML = `
                <div class="tree-item-name-wrap">
                    <span class="tree-item-arrow">${child.kind === 'directory' ? '▶' : '•'}</span>
                    <svg class="svg-icon"><use href="#icon-${icon}"/></svg>
                    <span class="tree-item-name">${child.name}</span>
                    <div class="tree-item-actions">
                        ${isGitClone ? `<button class="icon-button git-actions-btn" title="Git Actions"><svg class="svg-icon"><use href="#icon-git-folder"></use></svg></button>` : ''}
                    </div>
                </div>`;
            
            // 7. Append to the DOM and attach event listeners
            parentElement.appendChild(li);
            const nameWrap = li.querySelector('.tree-item-name-wrap');

            const gitBtn = li.querySelector('.git-actions-btn');
            if (gitBtn) {
                gitBtn.onclick = (e) => {
                    e.stopPropagation();
                    GitManager.showGitUI(fullChildItem); // Pass the folder item
                };
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
                        this.renderTree(newUl, fullChildItem, depth + 1);
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
            
            // 8. Update state and handle recursion for expanded folders
            State.domItemMap.set(uniquePath, { el: li, item: fullChildItem });

            const isExpanded = State.expandedFolders.has(uniquePath);
            if (isExpanded) {
                li.classList.add('expanded');
                const newUl = document.createElement('ul');
                li.appendChild(newUl);
                // Recursion is safe here because we've already finished the async check for this level
                this.renderTree(newUl, fullChildItem, depth + 1);
            }
        })); // End of Promise.all

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
