// B"H
// FILE: js/workspaces.js
import { State , DOM} from './state.js';
import { Menus } from './menus.js';
import { App } from './app.js';
import { GitManager } from './git/index.js'; 
import { UI } from './ui.js';
import { FileOperations } from './file-operations.js'; 
import { Tabs } from './tabs.js';
import { WorkspaceTreeRenderer } from './workspaces/tree-rendering.js'; 

export const getItemUniquePath = (item) => {
    if (item.type === 'zip-entry') {
        return `zip-${item.zipTabId}::${item.path}`;
    }
    return `${item.workspaceId ?? item.id}::${item.path ?? '/'}`;
};

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

    setupDragDrop(element, item) {
        if (!item || (item.kind !== 'directory' && item.path !== '/')) return;

        const isReadOnly = State.workspaces.find(ws => ws.id === item.workspaceId)?.readOnly;
        if (isReadOnly) return;

        element.addEventListener('dragover', (e) => {
            e.preventDefault(); 
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
                     rootItem.type === 'ssh' ? 'ssh' : 
                     rootItem.type === 'opfs' ? 'save' : 'brain';

        let statusBadge = '';
        if (ws.isLocked) {
            statusBadge = /*html*/`<span style="font-size: 0.7em; margin-left:8px; padding: 2px 6px; border-radius: 4px; background: var(--color-accent-warning); color: #000;">🔒 Resume</span>`;
        } else if (ws.isLost) {
            statusBadge = /*html*/`<span style="font-size: 0.7em; margin-left:8px; padding: 2px 6px; border-radius: 4px; background: var(--color-accent-danger); color: #fff;">⚠️ Lost</span>`;
        }

        const showGitActions = rootItem.isGitClone || rootItem.type === 'github';

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
                    ${showGitActions ? `<button class="icon-button git-actions-btn" title="Git Actions"><svg class="svg-icon"><use href="#icon-git-branch"></use></svg></button>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(wsRoot);
        
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
                WorkspaceTreeRenderer.renderTree(tree, rootItem, 1);
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
           WorkspaceTreeRenderer.renderTree(tree, rootItem, 1);
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
        if (item.type === 'zip-entry') {
            const zipTab = State.tabs.find(t => t.id === item.zipTabId);
            if (zipTab) {
                import('./zip/zip-explorer.js').then(m => m.ZipExplorer.render(zipTab));
            }
            return;
        }

        const uniquePath = getItemUniquePath(item);
        const entry = State.domItemMap.get(uniquePath);
        
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        if (workspace && workspace.type === 'github') {
            workspace._treeCache = null; 
        }

        if (!entry) return;

        const directoryElement = entry.el;
        
        if (State.expandedFolders.has(uniquePath)) {
            directoryElement.classList.add('expanded');
            
            let childrenContainer = directoryElement.querySelector('ul');
            if (childrenContainer) {
                childrenContainer.remove();
            }
            
            childrenContainer = document.createElement('ul');
            const isRoot = directoryElement.classList.contains('workspace-root');
            if (isRoot) childrenContainer.className = 'workspace-tree';
            directoryElement.appendChild(childrenContainer);
            
            const depth = isRoot ? 1 : (item.path.match(/\//g) || []).length + 1;
            await WorkspaceTreeRenderer.renderTree(childrenContainer, item, depth);
        }
    }
};