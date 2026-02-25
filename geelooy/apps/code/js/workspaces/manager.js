
// B"H
/**
 * @file workspaces/manager.js
 * @brief The Guardian of the Project Worlds.
 * 
 * THE NOVEL OF THE RECOVERED KEY:
 * The lock was heavy, a slab of digital iron,
 * But the Seeker held the memory of the light.
 * "Resume," he commanded, and the code did stir,
 * Re-connecting the mind to the physical byte.
 * If the handle is lost, if the permission is gone,
 * We reveal the truth so the work can go on.
 * Refreshing the tree, manifesting the form,
 * Sheltering the logic from every storm.
 */

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
    /**
     * @async
     * @function render
     * @description B"H - Re-manifests the entire sidebar tree.
     */
    async render() {
        DOM.workspacesContainer.innerHTML = '';
        if (State.workspaces.length === 0) {
            DOM.workspacesContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--color-text-tertiary);">
                    Seek and ye shall find.<br>Add a workspace to begin.
                </div>`;
            return;
        }
        for (const ws of State.workspaces) {
            await this.renderWorkspace(ws, DOM.workspacesContainer);
        }
    },

    /**
     * @function add
     * @description Spawning a new world into the sidebar.
     */
    add(ws, shouldSave = true) {
        const isNew = ws.id === undefined;
        const newWs = { id: isNew ? State.nextWorkspaceId++ : ws.id, ...ws };
        State.workspaces.push(newWs);
        if (shouldSave) {
            this.render(); // Full re-render for consistency
            App.saveSession();
        }
    },

    /**
     * @async
     * @function renderWorkspace
     * @description Forging the physical form of a single workspace anchor.
     */
	async renderWorkspace(ws, container) {
	    const wsRoot = document.createElement('div');
	    wsRoot.className = 'workspace-root';

	    const rootItem = { ...ws, path: '/', workspaceId: ws.id, kind: 'directory' };
	    const uniquePath = getItemUniquePath(rootItem);
	    
        const isLocked = ws.type === 'local' && (ws.isLocked || !ws.handle);

	    wsRoot.innerHTML = `
            <div class="workspace-header ${isLocked ? 'locked' : ''}" data-ws-id="${ws.id}">
                <div class="workspace-header-title">
                    <svg class="svg-icon"><use href="#icon-${isLocked ? 'settings' : 'folder'}"></use></svg>
                    <span>${ws.name}</span>
                    ${isLocked ? '<span class="resume-badge">RESUME</span>' : ''}
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

	    State.domItemMap.set(uniquePath, { el: wsRoot, item: rootItem });
	
	    if (State.expandedFolders.has(uniquePath) && !isLocked) {
	       const tree = document.createElement('ul');
	       wsRoot.appendChild(tree);
	       await WorkspaceTreeRenderer.renderTree(tree, rootItem, 1);
	    }
	},

    /**
     * @async
     * @function resumeWorkspace
     * @description B"H - Re-awakening a local folder connection.
     */
    async resumeWorkspace(ws) {
        if (ws.type !== 'local') return;
        
        UI.showToast(`B"H - Re-anchoring "${ws.name}"...`, "info");
        
        try {
            const handle = await RecoveryRitual.attemptActivation(ws);
            if (handle) {
                ws.isLocked = false;
                ws.isLost = false;
                ws.handle = handle;
                
                UI.showToast(`B"H - Connection restored!`, "success");
                await this.render(); // Re-render to clear "locked" UI
            } else {
                throw new Error("Handle retrieval cancelled or failed.");
            }
        } catch (e) {
            console.error(`[Workspace] B"H - Resume Failed:`, e);
            UI.showDialog({
                title: "Resume Failed",
                message: `Could not connect to "${ws.name}". Error: ${e.message}\n\nYou may need to remove and re-add the folder if the physical directory was moved.`,
                okText: "I Understand"
            });
        }
    },

    /**
     * @async
     * @function remove
     * @description Retracting a workspace from reality.
     */
    async remove(workspaceId) {
        const id = Number(workspaceId);
        State.workspaces = State.workspaces.filter(ws => Number(ws.id) !== id);
        
        // Clean up memory
        HandleCache.clear(); 
        for (const key of State.expandedFolders) if (key.startsWith(`${id}::`)) State.expandedFolders.delete(key);
        
        App.saveSession(); 
        await this.render();
        UI.showToast("B\"H - World retracted.", "info");
    },
    
    /**
     * @async
     * @function refreshNode
     * @description B"H - Re-perceiving a specific folder's contents.
     */
    async refreshNode(item) {
        if (!item) return;
        const uniquePath = getItemUniquePath(item);
        const entry = State.domItemMap.get(uniquePath);
        if (!entry) return;

        console.log(`[Workspace] B"H - Refreshing node: ${item.path}`);

        let childrenContainer = entry.el.querySelector('ul');
        if (childrenContainer) {
            childrenContainer.innerHTML = '';
        } else {
            childrenContainer = document.createElement('ul');
            entry.el.appendChild(childrenContainer);
            entry.el.classList.add('expanded');
            State.expandedFolders.add(uniquePath);
        }
        
        const depth = (item.path.split('/').filter(Boolean)).length;
        await WorkspaceTreeRenderer.renderTree(childrenContainer, item, depth + 1);
    }
};
