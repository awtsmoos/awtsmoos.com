
// B"H
import { State, DOM } from '../state.js';
import { App } from '../app.js';
import { Tabs } from '../tabs/index.js';
import { UI } from '../ui.js';
import { WorkspaceTreeRenderer } from './tree-renderer.js';
import { Menus } from '../menus/index.js';
import { getItemUniquePath } from './utils.js';
import { HandleCache } from '../fs/local/handle-cache.js';

export const WorkspaceManager = {
    async render() {
        DOM.workspacesContainer.innerHTML = '';
        if (State.workspaces.length === 0) {
            DOM.workspacesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: gray;">The void is endless...<br>Call forth a world.</div>`;
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
            this.render(); 
            App.saveSession();
        }
    },

	async renderWorkspace(ws, container) {
	    const wsRoot = document.createElement('div');
	    wsRoot.className = 'workspace-root';

	    const rootItem = { ...ws, path: '/', workspaceId: ws.id, kind: 'directory' };
	    const uniquePath = getItemUniquePath(rootItem);
	    
        // A workspace is truly considered locked ONLY if explicitly told so after a failure.
        const isLocked = !!ws.isLocked;

        let displayName = ws.name;
        let subText = '';

        // B"H - Extracting the true name and the full path for Relay (and others)
        if (ws.type === 'relay') {
            const normalized = (ws.basePath || ws.name).replace(/\\/g, '/');
            const shortName = normalized === '/' ? 'Relay Root' : normalized.split('/').filter(Boolean).pop();
            displayName = shortName.replace(/^Relay:\s*/i, '');
            subText = `Relay: ${ws.basePath || ws.relayUrl}`;
        } else if (ws.type === 'local' && ws.handle) {
            displayName = ws.handle.name;
            subText = 'Local File System';
        } else if (ws.type === 'github') {
            displayName = ws.repoInfo ? ws.repoInfo.repo : ws.name;
            subText = `GitHub: ${ws.repoInfo ? ws.repoInfo.owner : ''}`;
        } else if (ws.type === 'indexeddb') {
            displayName = 'Browser Storage';
            subText = 'IndexedDB';
        } else if (ws.type === 'opfs') {
            displayName = 'Origin Private FS';
            subText = 'High Performance Local';
        }

	    wsRoot.innerHTML = `
            <div class="workspace-header ${isLocked ? 'locked' : ''}" data-ws-id="${ws.id}">
                ${subText ? `<div class="workspace-header-sub">${subText}</div>` : ''}
                <div class="workspace-header-main">
                    <svg class="svg-icon"><use href="#icon-${isLocked ? 'settings' : 'folder'}"></use></svg>
                    <span>${displayName}</span>
                </div>
            </div>`;
	    container.appendChild(wsRoot);
        
        const header = wsRoot.querySelector('.workspace-header');
	    
	    header.onclick = async () => {
            if (isLocked) {
                // To restore connection, we prompt permission aggressively upon user interaction!
                if (ws.handle) {
                    try {
                        const check = await ws.handle.requestPermission({mode: 'readwrite'});
                        if(check === 'granted') {
                            ws.isLocked = false;
                            this.render();
                            UI.showToast("B\"H - Bond forged anew.", "success");
                            return;
                        }
                    } catch(e) { /* ignore */ }
                }
                
                const deletePurge = await UI.showDialog({
                    title: "Fractured Bridge",
                    message: `The connection to '${ws.name}' was destroyed by the environment. Remove it from your workspace list?`,
                    okText: "Remove Lost World"
                });
                if(deletePurge) this.remove(ws.id);
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

    async remove(workspaceId) {
        const id = Number(workspaceId);
        State.workspaces = State.workspaces.filter(ws => Number(ws.id) !== id);
        HandleCache.clear(); 
        
        for (const key of State.expandedFolders) {
            if (key.includes(`::${id}::`)) State.expandedFolders.delete(key);
        }
        
        const tabsToClose = State.tabs.filter(t => Number(t.item.workspaceId) === id || Number(t.item.id) === id);
        for (const tab of tabsToClose) await Tabs.close(tab.id, true);
        
        App.saveSession(); 
        await this.render();
    },
    
    async refreshNode(item) {
        if (!item) return;
        const uniquePath = getItemUniquePath(item);
        const entry = State.domItemMap.get(uniquePath);
        if (!entry) return;

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
