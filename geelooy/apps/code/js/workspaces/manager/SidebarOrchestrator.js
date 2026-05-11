
// B"H
/**
 * @file SidebarOrchestrator.js
 * @brief conductive conductor of the visual tree.
 */

import { State, DOM } from '../../state.js';
import { VisualManifestor } from './VisualManifestor.js';
import { NodeRegistry } from './NodeRegistry.js';
import { WorkspaceTreeRenderer } from '../tree-rendering.js';
import { getItemUniquePath } from '../utils.js';
import { Menus } from '../../menus/index.js';
import { UI } from '../../ui.js';
import { HTML } from '../../html-generator.js';

export const SidebarOrchestrator = {
    /**
     * B"H - Rebuilds the entire physical sidebar.
     */
    async rebuild() {
        const container = DOM.workspacesContainer;
        if (!container) return;

        console.log("B\"H [Sidebar] Manifesting " + State.workspaces.length + " worlds.");
        
        container.innerHTML = '';
        NodeRegistry.clear();

        if (State.workspaces.length === 0) {
            container.appendChild(HTML({
                style: { padding: '20px', textAlign: 'center', color: 'gray' },
                html: 'The void is endless...<br>Call forth a world.'
            }));
            return;
        }

        for (const ws of State.workspaces) {
            await this._processWorkspace(ws, container);
        }
    },

    async _processWorkspace(ws, container) {
        const { displayName, subText } = this._resolveIdentity(ws);
        const isLocked = !!ws.isLocked;

        const rootItem = { ...ws, path: '/', workspaceId: ws.id, kind: 'directory' };
        const uniquePath = getItemUniquePath(rootItem);

        const callbacks = {
            onClick: () => {
                if (isLocked) return this._handleLockedClick(ws);
                WorkspaceTreeRenderer.toggleDirectory(uniquePath, null, rootItem, 0, true);
            },
            onMenu: (e) => Menus.show(e, rootItem)
        };

        const physicalVessel = VisualManifestor.manifest(ws, displayName, subText, isLocked, callbacks);
        container.appendChild(physicalVessel);
        NodeRegistry.register(rootItem, physicalVessel);

        if (State.expandedFolders.has(uniquePath) && !isLocked) {
            const tree = document.createElement('ul');
            tree.className = 'tree-branch';
            physicalVessel.appendChild(tree);
            await WorkspaceTreeRenderer.renderTree(tree, rootItem, 1);
        }
    },

    _resolveIdentity(ws) {
        let displayName = ws.name;
        let subText = "";

        if (ws.type === 'relay') {
            const normalized = (ws.basePath || ws.name).replace(/\\/g, '/');
            displayName = normalized === '/' ? 'Relay Root' : normalized.split('/').filter(Boolean).pop();
            subText = `Relay: ${ws.basePath || ws.relayUrl}`;
        } else if (ws.type === 'local' && ws.handle) {
            displayName = ws.handle.name;
            subText = 'Local File System';
        } else if (ws.type === 'github') {
            displayName = ws.repoInfo ? ws.repoInfo.repo : ws.name;
            subText = `GitHub: ${ws.repoInfo ? ws.repoInfo.owner : ''}`;
        } else {
            subText = (ws.type || "").toUpperCase();
        }

        return { displayName, subText };
    },

    async _handleLockedClick(ws) {
        if (ws.handle) {
            try {
                const check = await ws.handle.requestPermission({mode: 'readwrite'});
                if(check === 'granted') {
                    ws.isLocked = false;
                    this.rebuild();
                    UI.showToast("B\"H - Bond forged anew.", "success");
                    return;
                }
            } catch(e) {}
        }
        UI.showToast("B\"H - World is sealed. Re-link required.", "warning");
    }
};
