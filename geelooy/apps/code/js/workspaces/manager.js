
// B"H
// FILE: js/workspaces/manager.js

import { State, DOM } from '../state.js';
import { App } from '../app.js';
import { Tabs } from '../tabs/index.js';
import { UI } from '../ui.js';
import { WorkspaceTreeRenderer } from './tree-renderer.js';
import { GitMetaProvider } from '../git/meta.js';
import { Menus } from '../menus/index.js';
import { GitManager } from '../git/index.js';
import { getItemUniquePath } from './utils.js';
import { RecoveryRitual } from '../fs/local/recovery-ritual.js';
import { HandleCache } from '../fs/local/handle-cache.js';

export const WorkspaceManager = {
    async render() {
        DOM.workspacesContainer.innerHTML = '';
        if (State.workspaces.length === 0) {
            DOM.workspacesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--color-text-secondary);">Add a workspace to begin.</div>`;
            return;
        }
        for (const ws of State.workspaces) {
            await this.renderWorkspace(ws, DOM.workspacesContainer);
        }
    },

    add(ws, shouldSave = true) {
        const isNew = ws.id === undefined;
        const newWs = { id: isNew ? State.nextWorkspaceId++ : ws.id, ...ws };
        State.workspaces.push(newWs);
        if (shouldSave) {
            this.renderWorkspace(newWs, DOM.workspacesContainer);
            App.saveSession();
        }
    },

	async renderWorkspace(ws, container) {
	    const wsRoot = document.createElement('div');
	    wsRoot.className = 'workspace-root';

	    const rootItem = { ...ws, path: '/', workspaceId: ws.id, kind: 'directory' };
	    const uniquePath = getItemUniquePath(rootItem);
	    
        if (ws.isGitClone === undefined && ['local','opfs','indexeddb'].includes(ws.type)) {
            const info = await GitMetaProvider.getGitInfoForFolder(rootItem);
            ws.isGitClone = !!info;
            rootItem.isGitClone = !!info;
        }

	    const isExpanded = State.expandedFolders.has(uniquePath);
	    if (isExpanded) wsRoot.classList.add('expanded');
	
	    const icon = rootItem.isGitClone ? 'git-folder' : (ws.type === 'local' ? 'laptop' : 'brain');
        // Only local folders show as "locked" if handle is missing.
        const isLocked = ws.type === 'local' && ws.isLocked;

	    wsRoot.innerHTML = `
            <div class="workspace-header ${isLocked ? 'locked' : ''}">
                <div class="workspace-header-title">
                    <svg class="svg-icon"><use href="#icon-${isLocked ? 'settings' : icon}"></use></svg>
                    <span>${ws.name}</span>
                    ${isLocked ? '<span style="font-size:0.7em; color:var(--color-accent-warning); margin-left:8px;">[Resume]</span>' : ''}
                </div>
                <div class="workspace-header-actions">
                    ${rootItem.isGitClone && !isLocked ? `<button class="icon-button git-actions-btn" title="Git"><svg class="svg-icon"><use href="#icon-git-branch"></use></svg></button>` : ''}
                </div>
            </div>`;
	    container.appendChild(wsRoot);
        
        const header = wsRoot.querySelector('.workspace-header');
	    
	    header.onclick = async () => {
            if (isLocked) {
                await this.resumeWorkspace(ws);
                return;
            }
            WorkspaceTreeRenderer.toggleDirectory(uniquePath, wsRoot, rootItem, 0, true);
        };

	    header.oncontextmenu = (e) => Menus.show(e, rootItem);
	    
        const gitBtn = wsRoot.querySelector('.git-actions-btn');
	    if (gitBtn) gitBtn.onclick = (e) => { e.stopPropagation(); GitManager.showGitUI(rootItem, rootItem.isGitClone); };

	    State.domItemMap.set(uniquePath, { el: wsRoot, item: rootItem });
	
	    if (isExpanded && !isLocked) {
	       const tree = document.createElement('ul');
	       wsRoot.appendChild(tree);
	       await WorkspaceTreeRenderer.renderTree(tree, rootItem, 1);
	    }
	},

    async resumeWorkspace(ws) {
        if (ws.type !== 'local') return;
        const recovered = await RecoveryRitual.reAnchor(ws);
        if (recovered) this.render();
    },

    /**
     * @async
     * @function remove
     * @description The Tikkun of Removal. Purges all ghost states from the machine.
     */
    async remove(workspaceId) {
        const id = Number(workspaceId);
        
        // 1. Close associated tabs
        const tabsToClose = State.tabs.filter(t => Number(t.item.workspaceId) === id);
        for (const tab of tabsToClose) await Tabs.close(tab.id, true);
        
        // 2. Clear from expanded folders set
        for (const pathKey of State.expandedFolders) {
            if (pathKey.startsWith(`${id}::`)) State.expandedFolders.delete(pathKey);
        }

        // 3. Clear from DOM Item Map
        for (const [pathKey, entry] of State.domItemMap) {
            if (pathKey.startsWith(`${id}::`)) State.domItemMap.delete(pathKey);
        }

        // 4. Clear physical handle cache
        HandleCache.clear(); 

        // 5. Remove from primary state
        State.workspaces = State.workspaces.filter(ws => Number(ws.id) !== id);
        
        App.saveSession(); 
        await this.render();
        UI.showToast("Workspace retracted.", "info");
    },
    
    async refreshNode(item) {
        const uniquePath = getItemUniquePath(item);
        const entry = State.domItemMap.get(uniquePath);
        if (!entry) return;

        let childrenContainer = entry.el.querySelector('ul');
        if (childrenContainer) childrenContainer.innerHTML = '';
        else {
            childrenContainer = document.createElement('ul');
            entry.el.appendChild(childrenContainer);
        }
        
        const depth = (item.path.match(/\//g) || []).length;
        await WorkspaceTreeRenderer.renderTree(childrenContainer, item, depth + 1);
    }
};
