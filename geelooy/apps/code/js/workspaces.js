// B"H
// FILE: js/workspaces.js
// B"H - IN: js/workspaces.js
import { SelectionManager } from './selection-manager.js';
import { State , DOM} from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs.js';
import { Menus } from './menus.js';
import { App } from './app.js';
import { GitManager } from './git-manager.js'; 
import { GitMetaProvider } from './git-meta-provider.js'; 
import { UI } from './ui.js';
import { FileOperations } from './file-operations.js'; // B"H - Added Import

export const getItemUniquePath = (item) => `${item.workspaceId ?? item.id}::${item.path ?? '/'}`;

export const Workspaces = {
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

    /*B"H*/
    /**
     * B"H - Helper to attach Drag & Drop listeners to a folder element.
     */
    setupDragDrop(element, item) {
        // Only directories (and the root) can receive drops
        if (!item || (item.kind !== 'directory' && item.path !== '/')) return;

        const isReadOnly = State.workspaces.find(ws => ws.id === item.workspaceId)?.readOnly;
        if (isReadOnly) return;

        element.addEventListener('dragover', (e) => {
            e.preventDefault(); // Required to allow dropping
            e.stopPropagation();
            element.classList.add('drag-over-target');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over-target');
        });

        element.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over-target');
            
            // Check if files are being dropped (vs text/other)
            if (e.dataTransfer.types.includes('Files')) {
                await FileOperations.handleDrop(e, item);
            }
        });
    },

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
        
        // B"H - Attach DnD to the Header (Root)
        const header = wsRoot.querySelector('.workspace-header');
        this.setupDragDrop(header, rootItem);

        const headerTitle = wsRoot.querySelector('.workspace-header-title');

        headerTitle.onclick = async () => {
            if (ws.isLocked && !ws.isLost) {
                try {
                    const perm = await ws.handle.requestPermission({ mode: 'readwrite' });
                    if (perm === 'granted') {
                        ws.isLocked = false;
                        const stateWs = State.workspaces.find(w => w.id === ws.id);
                        if (stateWs) stateWs.isLocked = false;
                        wsRoot.remove();
                        this.renderWorkspace(ws, container);
                        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
                        if (activeTab && activeTab.item.workspaceId === ws.id) {
                            activeTab.forceReload = true;
                            await Tabs.activate(activeTab.id);
                        }
                        UI.showToast("Workspace resumed.", "success");
                        App.saveSession();
                    } else {
                        UI.showToast("Permission denied.", "warning");
                    }
                } catch (e) {
                    console.error("Resume error:", e);
                    UI.showToast("Error resuming workspace.", "error");
                }
                return; 
            }

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

    async renderTree(parentElement, parentItem, depth) {
        parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Loading...</li>`;
        try {
            let children;
            const workspace = State.workspaces.find(ws => ws.id === parentItem.workspaceId);

            if (parentItem.type === 'github' && workspace) {
                if (!workspace._treeCache) {
                    parentElement.innerHTML = `<li class="tree-item" style="--depth:${depth}; color: var(--color-text-tertiary);">Building repository map...</li>`;
                    const fullTreeData = await FileSystemProvider.GitHub.getFullTree(parentItem);
                    
                    const cache = new Map();
                    if (fullTreeData.tree) {
                        fullTreeData.tree.forEach(node => {
                            const pathParts = node.path.split('/');
                            pathParts.pop(); 
                            let parentPath = pathParts.join('/');
                            if (!cache.has(parentPath)) {
                                cache.set(parentPath, []);
                            }
                        });
                        fullTreeData.tree.forEach(node => {
                            const pathParts = node.path.split('/');
                            const name = pathParts.pop();
                            const parentPath = pathParts.join('/');
                            
                            cache.get(parentPath).push({
                               name: name,
                               kind: node.type === 'tree' ? 'directory' : 'file',
                               path: node.path, 
                               sha: node.sha 
                            });
                        });
                    }
                    workspace._treeCache = cache;
                }
                const lookupPath = parentItem.path === '/' ? '' : parentItem.path;
                children = workspace._treeCache.get(lookupPath) || [];
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
                const fullChildItem = { ...parentItem, ...child };
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
                
                // B"H - Attach DnD to Folder Items
                if (child.kind === 'directory') {
                    this.setupDragDrop(nameWrap, fullChildItem);
                }

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

    async remove(workspaceId) {
        UI.showLoading('Removing workspace...');
        const tabsToClose = State.tabs.filter(t => t.item.workspaceId === workspaceId);
        for (const tab of tabsToClose) {
            await Tabs.close(tab.id, true);
        }
        State.workspaces = State.workspaces.filter(ws => ws.id !== workspaceId);
        App.saveSession(); 
        this.render();
        UI.hideLoading();
    },
    
    async refreshNode(item) {
        const uniquePath = getItemUniquePath(item);
        const entry = State.domItemMap.get(uniquePath);
        
        // B"H - Clear Cache for GitHub Workspaces
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        if (workspace && workspace.type === 'github') {
            workspace._treeCache = null; // Bust cache to force API refetch
        }

        if (!entry) return;

        const directoryElement = entry.el;
        
        // If expanded, force re-render
        if (State.expandedFolders.has(uniquePath)) {
            directoryElement.classList.add('expanded');
            
            // Remove existing children to ensure clean slate
            let childrenContainer = directoryElement.querySelector('ul');
            if (childrenContainer) {
                childrenContainer.remove();
            }
            
            childrenContainer = document.createElement('ul');
            const isRoot = directoryElement.classList.contains('workspace-root');
            if (isRoot) childrenContainer.className = 'workspace-tree';
            directoryElement.appendChild(childrenContainer);
            
            const depth = isRoot ? 1 : (item.path.match(/\//g) || []).length + 1;
            await this.renderTree(childrenContainer, item, depth);
        }
    }
};