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
                     ws.type === 'github' ? 'github' : 
                     ws.type === 'ssh' ? 'ssh' : 'brain';

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
    


    

/*B"H*/
// ACTION: Please replace the entire 'renderTree' method in your 'js/workspaces.js' file with this one.
// This is the true root of the issue and will solve the problem.

/**
 * Asynchronously renders the file and folder tree. This is the definitive, corrected
 * version. It ensures that every child item is born with a complete and pure identity,
 * inheriting the essential context (like 'repoInfo' and 'readOnly') directly from
 * its immediate parent. This act of perfect inheritance heals all downstream errors,
 * from expanding folders to displaying the correct menu options.
 * @param {HTMLElement} parentElement - The UL element to render the children into.
 * @param {object} parentItem - The directory item whose children should be rendered. This item is now the source of truth.
 * @param {number} depth - The current depth in the tree for styling.
 */
async renderTree(parentElement, parentItem, depth) {
    // A loading message, a breath before creation.
    parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Loading...</li>`;
    try {
        // We ask the filesystem for the raw data of the children.
        const children = await FileSystemProvider.list(parentItem);
        parentElement.innerHTML = ''; // The void is cleared.
        children.sort((a, b) => (a.kind === b.kind) ? a.name.localeCompare(b.name) : (a.kind === 'directory' ? -1 : 1));
        
        if (children.length === 0) {
            parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary); font-style: italic;">Empty</li>`;
            return;
        }

        // For each raw child, we perform the rite of "full creation".
        for (const child of children) {
            if (child.name === '.gitkeep') continue;

            // THIS IS THE HEART OF THE CORRECTION:
            // We are no longer looking up the main workspace. We are building the child's
            // soul directly from its parent. This is true inheritance.
            const fullChildItem = {
                // The unique properties of the child itself:
                name: child.name,
                kind: child.kind,
                path: child.path,
                sha: child.sha, // This will be undefined for non-GitHub types, which is correct.

                // The essential context inherited directly from its parent:
                workspaceId: parentItem.workspaceId,
                type: parentItem.type,
                repoInfo: parentItem.repoInfo,
                branch: parentItem.branch,
                readOnly: parentItem.readOnly // The crucial property is now passed down.
            };
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

            // ... (The rest of the click handlers and logic remain identical, but they will now
            // receive the 'fullChildItem' with the correct 'readOnly' property) ...

            if (fullChildItem.isGitClone) {
                const gitBtn = document.createElement('button');
                gitBtn.className = 'icon-button git-actions-btn';
                gitBtn.title = 'Git Actions';
                gitBtn.innerHTML = `<svg class="svg-icon"><use href="#icon-git-branch"></use></svg>`;
                gitBtn.onclick = (e) => { e.stopPropagation(); GitManager.showGitUI(fullChildItem); };
                nameWrap.appendChild(gitBtn);
            }
            
            nameWrap.onclick = (e) => {
                e.stopPropagation();
                if (State.isSelectionModeActive) { SelectionManager.toggle(fullChildItem); return; }
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
                        this.renderTree(newUl, fullChildItem, depth + 1); // The complete child is passed on.
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


    
/*B"H*/

/**
 * Removes a workspace and all its associated tabs from the application state.
 * This is the act of banishment, of returning a realm's portal to the void.
 * @param {number} workspaceId - The ID of the workspace to remove.
 */
async remove(workspaceId) {
    UI.showLoading('Removing workspace...');
    
    // Close all tabs that belong to the departing workspace.
    const tabsToClose = State.tabs.filter(t => t.item.workspaceId === workspaceId);
    for (const tab of tabsToClose) {
        // The 'true' flag forces closure without prompting for saves.
        await Tabs.close(tab.id, true);
    }
    
    // Filter the workspace out of existence.
    State.workspaces = State.workspaces.filter(ws => ws.id !== workspaceId);

    App.saveSession(); // Persist this new state of being.
    this.render();     // Re-draw the world without the banished realm.
    
    UI.hideLoading();
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
