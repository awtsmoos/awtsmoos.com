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

add(ws, shouldSave = true) {
    // Clear the "Add a workspace to begin" message if it exists
    const emptyMessage = DOM.workspacesContainer.querySelector('div[style*="padding: 20px"]');
    if (emptyMessage) {
        DOM.workspacesContainer.innerHTML = '';
    }
    
    // Add the new workspace to our state
    const isNew = ws.id === undefined;
    const newWs = { id: isNew ? State.nextWorkspaceId++ : ws.id, ...ws };
    State.workspaces.push(newWs);
    
    // --- THE FIX IS HERE ---
    // Explicitly render the single new workspace we just added.
    this.renderWorkspace(newWs, DOM.workspacesContainer);
    
    // Save the session if this workspace is meant to be persistent
    if (shouldSave) {
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

    

// In workspaces.js, replace the entire renderWorkspace method

async renderWorkspace(ws, container) {
    const wsRoot = document.createElement('div');
    wsRoot.className = 'workspace-root';
    const uniquePath = getItemUniquePath(ws);

    const gitInfo = await GitMetaProvider.getGitInfoForFolder({ ...ws, kind: 'directory' });
    const isGitClone = !!gitInfo;

    const icon = isGitClone ? 'git-folder' :
                 ws.type === 'local' ? 'laptop' :
                 ws.type === 'github' ? 'github' :
                 ws.type === 'osfolder' ? 'folder' :
                 'brain';

    wsRoot.innerHTML = /*html*/ `
        <div class="workspace-header">
            <div class="workspace-header-title">
                <strong>
                    <svg class="svg-icon"><use href="#icon-${icon}"></use></svg>
                    ${ws.name}
                </strong>
            </div>
            <div class="workspace-header-actions">
                ${isGitClone ? `<button class="icon-button git-actions-btn" title="Git Actions"><svg class="svg-icon"><use href="#icon-git-branch"></use></svg></button>` : ''}
            </div>
        </div>
    `;
    
    container.appendChild(wsRoot);
    const header = wsRoot.querySelector('.workspace-header');
    const rootItemForTree = { ...ws, workspaceId: ws.id, kind: 'directory' };

    // --- SIMPLIFIED AND CORRECTED ONCLICK LOGIC ---
    header.onclick = (e) => {
        // Prevent event bubbling issues
        if (e.target.closest('.git-actions-btn')) return;

        const tree = wsRoot.querySelector('ul.workspace-tree');
        if (tree) {
            // If the tree exists, remove it and collapse
            tree.remove();
            wsRoot.classList.remove('expanded');
            State.expandedFolders.delete(uniquePath);
        } else {
            // If it doesn't exist, create it and expand
            const newTree = document.createElement('ul');
            newTree.className = 'workspace-tree';
            wsRoot.appendChild(newTree);
            wsRoot.classList.add('expanded');
            State.expandedFolders.add(uniquePath);
            this.renderTree(newTree, rootItemForTree, 1);
        }
        App.saveSession();
    };
    // --- END OF FIX ---

    header.oncontextmenu = (e) => Menus.show(e, rootItemForTree);
    
    const gitBtn = header.querySelector('.git-actions-btn');
    if (gitBtn) {
        gitBtn.onclick = (e) => { e.stopPropagation(); GitManager.showGitUI(rootItemForTree); };
    }
    
    State.domItemMap.set(uniquePath, { el: wsRoot, item: rootItemForTree });

    // This part now correctly handles the initial render on load
    if (State.expandedFolders.has(uniquePath)) {
       wsRoot.classList.add('expanded');
       const tree = document.createElement('ul');
       tree.className = 'workspace-tree';
       wsRoot.appendChild(tree);
       this.renderTree(tree, rootItemForTree, 1);
    }
},
    


    


async renderTree(parentElement, parentItem, depth) {
    parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Loading...</li>`;
    try {
        const children = await FileSystemProvider.list(parentItem);
        parentElement.innerHTML = ''; // Clear "Loading..."

        children.sort((a, b) => (a.kind === b.kind) ? a.name.localeCompare(b.name) : (a.kind === 'directory' ? -1 : 1));
        
        if (children.length === 0) {
            parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary); font-style: italic;">(empty)</li>`;
            return;
        }

        for (const child of children) {
            if (child.name === '.gitkeep' || child.name === '.awtsmoos-repo') continue;

            const fullChildItem = { ...parentItem, ...child, workspaceId: parentItem.workspaceId };
            const uniquePath = getItemUniquePath(fullChildItem);
            
            const gitInfo = child.kind === 'directory' ? await GitMetaProvider.getGitInfoForFolder(fullChildItem) : null;
            const isGitClone = !!gitInfo;
            const icon = isGitClone ? 'git-folder' : (child.kind === 'directory' ? 'folder' : 'file');

            const li = document.createElement('li');
            li.className = 'tree-item';
            li.style.setProperty('--depth', depth);
            li.innerHTML = `
                <div class="tree-item-name-wrap">
                    <span class="tree-item-arrow">${child.kind === 'directory' ? '▶' : ''}</span>
                    <svg class="svg-icon"><use href="#icon-${icon}"/></svg>
                    <span class="tree-item-name">${child.name.replace('.folder','')}</span>
                    ${isGitClone ? `<div class="tree-item-actions"><button class="icon-button git-actions-btn" title="Git Actions"><svg class="svg-icon"><use href="#icon-git-branch"></use></svg></button></div>` : ''}
                </div>`;
            
            parentElement.appendChild(li);
            const nameWrap = li.querySelector('.tree-item-name-wrap');
            const gitBtn = li.querySelector('.git-actions-btn');
            if (gitBtn) gitBtn.onclick = (e) => { e.stopPropagation(); GitManager.showGitUI(fullChildItem); };
            
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

            nameWrap.oncontextmenu = (e) => Menus.show(e, fullChildItem);
            
            State.domItemMap.set(uniquePath, { el: li, item: fullChildItem });

            if (State.expandedFolders.has(uniquePath)) {
                li.classList.add('expanded');
                const newUl = document.createElement('ul');
                li.appendChild(newUl);
                this.renderTree(newUl, fullChildItem, depth + 1);
            }
        }
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