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
import { UI } from './ui.js';


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

    

/*B"H*/
/*B"H*/

/**
 * Renders the root of a single workspace. 
 * UPDATED: Recognizes the 'isLocked' property. If a workspace is locked (awaiting permission),
 * it displays a lock icon. Clicking the header triggers the 'requestPermission' flow
 * to resume the session, rather than expanding the tree.
 * @param {object} ws - The raw workspace object from the state.
 * @param {HTMLElement} container - The parent element.
 */
renderWorkspace(ws, container) {
    const wsRoot = document.createElement('div');
    wsRoot.className = 'workspace-root';

    const rootItem = { ...ws, path: '/', workspaceId: ws.id, kind: 'directory' };
    const uniquePath = getItemUniquePath(rootItem);
    const isExpanded = State.expandedFolders.has(uniquePath);
    if (isExpanded) wsRoot.classList.add('expanded');

    const icon = rootItem.isGitClone ? 'git-folder' : 
                 rootItem.type === 'local' ? 'laptop' : 
                 rootItem.type === 'github' ? 'github' : 
                 rootItem.type === 'ssh' ? 'ssh' : 'brain';

    // B"H: UI Logic for Locked/Lost State
    let statusBadge = '';
    if (ws.isLocked) {
        statusBadge = /*html*/`<span style="font-size: 0.7em; margin-left:8px; padding: 2px 6px; border-radius: 4px; background: var(--color-accent-warning); color: #000;">🔒 Resume</span>`;
    } else if (ws.isLost) {
        statusBadge = /*html*/`<span style="font-size: 0.7em; margin-left:8px; padding: 2px 6px; border-radius: 4px; background: var(--color-accent-danger); color: #fff;">⚠️ Lost</span>`;
    }

    wsRoot.innerHTML = /*html*/ `
        <div class="workspace-header ${ws.isLocked ? 'locked-workspace' : ''}" title="${ws.isLocked ? 'Click to resume session' : rootItem.name}">
            <div class="workspace-header-title">
                <strong>
                    <svg class="svg-icon"><use href="#icon-${icon}"></use></svg>
                    ${rootItem.name}
                    ${statusBadge}
                </strong>
            </div>
            <div class="workspace-header-actions">
                ${rootItem.isGitClone ? `<button class="icon-button git-actions-btn" title="Git Actions"><svg class="svg-icon"><use href="#icon-git-branch"></use></svg></button>` : ''}
            </div>
        </div>
    `;
    
    container.appendChild(wsRoot);
    const headerTitle = wsRoot.querySelector('.workspace-header-title');

    
    headerTitle.onclick = async () => {
        // --- B"H: PERMISSION RESURRECTION LOGIC ---
        if (ws.isLocked && !ws.isLost) {
            try {
                // We are inside a click handler, so we can request permission safely.
                const permission = await ws.handle.requestPermission({ mode: 'readwrite' });
                
                if (permission === 'granted') {
                    // Update State
                    ws.isLocked = false;
                    const storedWs = State.workspaces.find(w => w.id === ws.id);
                    if (storedWs) storedWs.isLocked = false;

                    UI.showToast("Workspace connection restored.", "success");
                    
                    // Re-render this specific node to remove the lock
                    // (Simple way: remove and re-add)
                    wsRoot.remove();
                    this.renderWorkspace(ws, container);
                } else {
                    UI.showToast("Permission denied.", "warning");
                }
            } catch (e) {
                console.error("Resume failed:", e);
                UI.showToast("Failed to resume workspace.", "error");
            }
            return; // Stop here, do not attempt to expand.
        }
        // ------------------------------------------

        // Standard Expansion Logic 
        const isCurrentlyExpanded = State.expandedFolders.has(uniquePath);
        if (isCurrentlyExpanded) {
            State.expandedFolders.delete(uniquePath);
        } else {
            State.expandedFolders.add(uniquePath);
        }
        App.saveSession();

        if (isCurrentlyExpanded) {
            wsRoot.classList.remove('expanded');
            const tree = wsRoot.querySelector('ul.workspace-tree');
            if (tree) {
                tree.remove(); 
            }
        } else {
            wsRoot.classList.add('expanded');
            const tree = document.createElement('ul');
            tree.className = 'workspace-tree';
            wsRoot.appendChild(tree);
            this.renderTree(tree, rootItem, 1);
        }
    };

    wsRoot.querySelector('.workspace-header').oncontextmenu = (e) => Menus.show(e, rootItem);
    const gitBtn = wsRoot.querySelector('.git-actions-btn');
    if (gitBtn) {
        gitBtn.onclick = (e) => { e.stopPropagation(); GitManager.showGitUI(rootItem); };
    }
    
    State.domItemMap.set(uniquePath, { el: wsRoot, item: rootItem });

    if (isExpanded && !ws.isLocked) {
       const tree = document.createElement('ul');
       tree.className = 'workspace-tree';
       wsRoot.appendChild(tree);
       this.renderTree(tree, rootItem, 1);
    }
},


/*B"H*/
/**
 * Asynchronously renders the file and folder tree. This definitive version uses a
 * complete repository tree (files and directories) to build a hyper-efficient cache
 * on first load. It no longer infers directory structures but knows them directly,
 * curing the initial load slowness. By mapping the full, unfiltered data, it
 * guarantees every file item retains its essential 'sha', permanently banishing the
 * "undefined blob" errors.
 * @param {HTMLElement} parentElement - The UL element to render the children into.
 * @param {object} parentItem - The directory item whose children should be rendered.
 * @param {number} depth - The current depth in the tree for styling.
 * @returns {Promise<void>}
 */
async renderTree(parentElement, parentItem, depth) {
    parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Loading...</li>`;
    try {
        let children;
        const workspace = State.workspaces.find(ws => ws.id === parentItem.workspaceId);

        if (parentItem.type === 'github' && workspace) {
            // --- START: NEW, SIMPLIFIED, AND CORRECT CACHING LOGIC ---
            if (!workspace._treeCache) {
                parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Building repository map...</li>`;
                const fullTreeData = await FileSystemProvider.GitHub.getFullTree(parentItem);
                
                const cache = new Map();
                // Pre-populate the map with every possible directory path from the tree.
                // This is efficient because the tree is a flat list.
                if (fullTreeData.tree) {
                    fullTreeData.tree.forEach(node => {
                        const pathParts = node.path.split('/');
                        pathParts.pop(); // We only care about the parent path.
                        let parentPath = pathParts.join('/');
                        if (!cache.has(parentPath)) {
                            cache.set(parentPath, []);
                        }
                    });
                     // Now, populate the cache with the actual items.
                    fullTreeData.tree.forEach(node => {
                        const pathParts = node.path.split('/');
                        const name = pathParts.pop();
                        const parentPath = pathParts.join('/');
                        
                        cache.get(parentPath).push({
                           name: name,
                           kind: node.type === 'tree' ? 'directory' : 'file',
                           path: node.path,
                           sha: node.sha // The essential essence is now always present.
                        });
                    });
                }
                workspace._treeCache = cache;
            }

            // The lookup is now direct and simple. The path for the root is an empty string in the cache.
            const lookupPath = parentItem.path === '/' ? '' : parentItem.path;
            children = workspace._treeCache.get(lookupPath) || [];
            // --- END: NEW CACHING LOGIC ---

        } else {
            children = await FileSystemProvider.list(parentItem);
        }

        parentElement.innerHTML = '';
        children.sort((a, b) => (a.kind === b.kind) ? a.name.localeCompare(b.name) : (a.kind === 'directory' ? -1 : 1));

        if (children.length === 0) {
            parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary); font-style: italic;">Empty</li>`;
            return;
        }

        for (const child of children) {
            if (child.name === '.gitkeep') continue;
            const fullChildItem = { ...parentItem,
                ...child
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
            if (fullChildItem.isGitClone) {
                const gitBtn = document.createElement('button');
                gitBtn.className = 'icon-button git-actions-btn';
                gitBtn.title = 'Git Actions';
                gitBtn.innerHTML = `<svg class="svg-icon"><use href="#icon-git-branch"></use></svg>`;
                gitBtn.onclick = (e) => {
                    e.stopPropagation();
                    GitManager.showGitUI(fullChildItem);
                };
                nameWrap.appendChild(gitBtn);
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
            State.domItemMap.set(uniquePath, {
                el: li,
                item: fullChildItem
            });
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