
// B"H
// FILE: js/vibe/modules/LoopEngine.js

import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces/index.js';
import { UI } from '../../ui.js';
import { Tabs } from '../../tabs/index.js';
import { GitMetaProvider } from '../../git/meta.js';

/**
 * @class LoopEngine
 * @classdesc The engine of transformation. It takes the abstract plans 
 * provided by the AI and manifests them into the physical reality of 
 * the disk. It is rectified to integrate perfectly with the Git system, 
 * staging every change so the user's timeline remains accurate.
 */
export const LoopEngine = {
    /**
     * @async
     * @function apply
     * @description B"H. The act of manifestation. It iterates through a list 
     * of required changes and shapes the vessels accordingly. 
     * It also stages changes in Git to prevent desynchronization.
     * @param {Array} changeList The list of required rectifications.
     * @param {number} workspaceId The world in which these changes occur.
     */
    async apply(changeList, workspaceId) {
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        if (!workspace) return;
        
        const physicalType = workspace.originalType || workspace.type;
        const parentsToRefresh = new Set();
        
        const taskId = `vibe-apply-${Date.now()}`;
        UI.startTask(taskId, "Manifesting AI rectifications...");

        for (let i = 0; i < changeList.length; i++) {
            const change = changeList[i];
            UI.updateTask(taskId, (i / changeList.length) * 100, `Writing: ${change.path.split('/').pop()}`);
            
            const item = { 
                ...workspace, 
                path: change.path, 
                kind: 'file', 
                workspaceId: workspaceId, 
                type: physicalType,
                originalType: physicalType
            };

            // Stage change in Git uncommitted store BEFORE writing to disk
            // This ensures the diff is immediate.
            const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
            if (gitInfo) {
                const uniqueStagingPath = `${workspaceId}::${change.path}`;
                if (change.operation === 'delete') {
                    await FileSystemProvider.IndexedDB.writeUncommitted(uniqueStagingPath, null, item);
                } else {
                    await FileSystemProvider.IndexedDB.writeUncommitted(uniqueStagingPath, change.content, item);
                }
            }

            if (change.operation === 'delete') {
                try { await FileSystemProvider.delete(item); } catch (e) {}
            } else {
                try {
                    await this._ensureDirectoryExists(workspace, change.path, physicalType);
                    await FileSystemProvider.write(item, change.content);
                } catch (writeErr) {
                    // Fallback to explicit creation if path is deep
                    const parts = change.path.split('/');
                    const name = parts.pop();
                    const parent = parts.join('/') || '/';
                    await FileSystemProvider.create({ ...workspace, path: parent, kind: 'directory', type: physicalType }, name, 'file');
                    await FileSystemProvider.write(item, change.content);
                }
            }
            
            const lastSlash = change.path.lastIndexOf('/');
            parentsToRefresh.add(lastSlash <= 0 ? '/' : change.path.substring(0, lastSlash));
            
            // Sync open tabs
            const openTab = State.tabs.find(t => t.item.path === change.path && t.item.workspaceId === workspaceId);
            if (openTab) {
                openTab.content = change.content;
                openTab.isDirty = false;
                if (State.activeTabId === openTab.id) {
                    await Tabs.activate(openTab.id);
                }
            }
        }

        UI.endTask(taskId, 'success', `Manifested ${changeList.length} files.`);

        for (const p of parentsToRefresh) {
            await Workspaces.refreshNode({ ...workspace, path: p, kind: 'directory', workspaceId: workspaceId, type: physicalType });
        }
    },
    
    /**
     * @async
     * @function _ensureDirectoryExists
     * @description Recursively ensures the path for a new vessel exists.
     */
    async _ensureDirectoryExists(workspace, filePath, physicalType) {
        const segments = filePath.split('/').filter(Boolean);
        if (segments.length <= 1) return;
        segments.pop(); 
        let currentPath = "";
        for (const segment of segments) {
            const parentPath = currentPath || "/";
            currentPath += "/" + segment;
            try {
                await FileSystemProvider.list({ ...workspace, path: currentPath, kind: 'directory', type: physicalType });
            } catch (e) {
                await FileSystemProvider.create({ ...workspace, path: parentPath, kind: 'directory', type: physicalType }, segment, 'directory');
            }
        }
    }
};
