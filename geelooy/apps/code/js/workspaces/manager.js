
// B"H
// FILE: js/workspaces/manager.js

import { State, DOM } from '../state.js';
import { App } from '../app.js';
import { Tabs } from '../tabs.js';
import { UI } from '../ui.js';
import { WorkspaceTreeRenderer } from './tree-renderer.js';
import { WorkspaceDragDrop } from './drag-drop.js';
import { GitMetaProvider } from '../git/meta.js';
import { Menus } from '../menus/index.js';
import { GitManager } from '../git/index.js';
import { getItemUniquePath } from './utils.js';

/**
 * @class WorkspaceManager
 * @classdesc This is the vessel of Chochmah (Wisdom), the raw, undifferentiated intellect
 * that holds the core logic for managing the set of all workspaces. It adds, removes,
 * and orchestrates the rendering of the highest-level vessels in the Explorer.
 */
export const WorkspaceManager = {
    /**
     * @async
     * @function render
     * @description The great manifestation. This function clears the old reality of the
     * workspace container and re-emanates it from the source of truth (State). It is the
     * constant act of creation that keeps the UI aligned with the spiritual root.
     */
    async render() {
        DOM.workspacesContainer.innerHTML = '';
        State.domItemMap.clear();
        if (State.workspaces.length === 0) {
            DOM.workspacesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--color-text-secondary);">Add a workspace to begin.</div>`;
            return;
        }
        
        for (const ws of State.workspaces) {
            await this.renderWorkspace(ws, DOM.workspacesContainer);
        }
    },

    /**
     * @function add
     * @description The divine speech that brings a new workspace into being. It assigns a unique
     * ID, a spiritual fingerprint, and adds it to the collective consciousness of the application state.
     * @param {object} ws The potential workspace data.
     * @param {boolean} shouldSave Whether this creation should be immediately recorded in the session history.
     */
    add(ws, shouldSave = true) {
        const isNew = ws.id === undefined;
        const newWs = { id: isNew ? State.nextWorkspaceId++ : ws.id, ...ws };
        
        State.workspaces.push(newWs);
        
        if (shouldSave) {
            this.renderWorkspace(newWs, DOM.workspacesContainer);
            App.saveSession();
        }
    },

    /**
     * @async
     * @function renderWorkspace
     * @description The focused act of manifesting a single workspace and all its interactive potential.
     * It builds the header, binds the holy actions of clicking, right-clicking, and receiving,
     * and then delegates the rendering of its inner contents to the Tree Renderer.
     * @param {object} ws The workspace to manifest.
     * @param {HTMLElement} container The parent DOM vessel to contain this new reality.
     */
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
	
	    wsRoot.innerHTML = `<div class="workspace-header">...</div>`; // Placeholder
	    container.appendChild(wsRoot);
        
        // Data-driven rendering via a UI generator would be more pure here
        const header = wsRoot.querySelector('.workspace-header');
        header.innerHTML = `
            <div class="workspace-header-title">
                <svg class="svg-icon"><use href="#icon-${icon}"></use></svg>
                <span>${ws.name}</span>
            </div>
            <div class="workspace-header-actions">
                ${rootItem.isGitClone ? `<button class="icon-button git-actions-btn" title="Git"><svg class="svg-icon"><use href="#icon-git-branch"></use></svg></button>` : ''}
            </div>
        `;
	    
	    header.onclick = () => WorkspaceTreeRenderer.toggleDirectory(uniquePath, wsRoot, rootItem, 0, true);
	    header.oncontextmenu = (e) => Menus.show(e, rootItem);
	    
        const gitBtn = wsRoot.querySelector('.git-actions-btn');
	    if (gitBtn) gitBtn.onclick = (e) => { e.stopPropagation(); GitManager.showGitUI(rootItem, rootItem.isGitClone); };

	    State.domItemMap.set(uniquePath, { el: wsRoot, item: rootItem });
	
	    if (isExpanded) {
	       const tree = document.createElement('ul');
	       wsRoot.appendChild(tree);
	       await WorkspaceTreeRenderer.renderTree(tree, rootItem, 1);
	    }
	},

    /**
     * @async
     * @function remove
     * @description The act of Tzimtzum (Contraction), removing a workspace and all its associated open tabs
     * from the application's reality, returning its essence to the void.
     * @param {number} workspaceId The spiritual fingerprint of the workspace to retract.
     */
    async remove(workspaceId) {
        const tabsToClose = State.tabs.filter(t => t.item.workspaceId === workspaceId);
        for (const tab of tabsToClose) await Tabs.close(tab.id, true);
        
        State.workspaces = State.workspaces.filter(ws => ws.id !== workspaceId);
        App.saveSession(); 
        await this.render();
    },
    
    /**
     * @async
     * @function refreshNode
     * @description A focused re-emanation. It dissolves the current view of a directory's children
     * and manifests it anew by querying the underlying filesystem reality.
     * @param {object} item The directory vessel to be refreshed.
     */
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
