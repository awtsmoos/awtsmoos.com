
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
 * @description The engine of physical transformation. 
 * Re-forged to ensure absolute Git synchronization.
 * 
 * THE RECTIFICATION:
 * When the AI speaks a new file, the engine now finds the 
 * Absolute Git Root of the workspace. It calculates the 
 * relative path from THAT root, ensuring the uncommitted_files 
 * vessel (IndexedDB) is updated at the correct coordinate.
 * Now, the Git Status UI shall never be blind to the AI's work.
 */
export const LoopEngine = {
    /**
     * @async
     * @function apply
     * @description B"H. Manifests plans into vessels.
     */
    async apply(changeList, workspaceId) {
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        if (!workspace) return;
        
        const physicalType = workspace.originalType || workspace.type;
        const parentsToRefresh = new Set();
        
        const taskId = `vibe-apply-${Date.now()}`;
        UI.startTask(taskId, "Staging AI Rectifications...");

        for (let i = 0; i < changeList.length; i++) {
            const change = changeList[i];
            UI.updateTask(taskId, (i / changeList.length) * 100, `Vessel: ${change.path.split('/').pop()}`);
            
            const item = { 
                ...workspace, 
                path: change.path, 
                kind: 'file', 
                workspaceId: workspaceId, 
                type: physicalType,
                originalType: physicalType
            };

            // B"H - THE CORE RECTIFICATION: Find Git Ancestry for the file
            const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
            if (gitInfo) {
                // Determine the correct relative path for the Staging Vessel
                const gitRootPath = gitInfo.path.replace(/\/+$/, "") || "/";
                const absoluteFilePath = change.path;
                let relToGit = absoluteFilePath;

                if (gitRootPath !== "/" && gitRootPath !== "" && absoluteFilePath.startsWith(gitRootPath + "/")) {
                    relToGit = absoluteFilePath.substring(gitRootPath.length + 1);
                } else if (gitRootPath === "/" || gitRootPath === "") {
                    relToGit = absoluteFilePath.startsWith("/") ? absoluteFilePath.substring(1) : absoluteFilePath;
                }

                // Stage the change in IndexedDB so Git Status can see it instantly
                const uniqueStagingKey = `${workspaceId}::${relToGit}`;
                const stagedItem = { ...item, path: relToGit };

                if (change.operation === 'delete') {
                    await FileSystemProvider.IndexedDB.writeUncommitted(uniqueStagingKey, null, stagedItem);
                } else {
                    await FileSystemProvider.IndexedDB.writeUncommitted(uniqueStagingKey, change.content, stagedItem);
                }
            }

            // Perform physical write
            if (change.operation === 'delete') {
                try { await FileSystemProvider.delete(item); } catch (e) {}
            } else {
                try {
                    await this._ensureDirectoryExists(workspace, change.path, physicalType);
                    await FileSystemProvider.write(item, change.content);
                } catch (writeErr) {
                    const parts = change.path.split('/');
                    const name = parts.pop();
                    const parent = parts.join('/') || '/';
                    await FileSystemProvider.create({ ...workspace, path: parent, kind: 'directory', type: physicalType }, name, 'file');
                    await FileSystemProvider.write(item, change.content);
                }
            }
            
            parentsToRefresh.add(change.path.substring(0, change.path.lastIndexOf('/')) || '/');
            
            // Update open tabs
            const openTab = State.tabs.find(t => t.item.path === change.path && t.item.workspaceId === workspaceId);
            if (openTab) {
                openTab.content = change.content;
                openTab.isDirty = false;
                openTab.isUncommitted = true;
                if (State.activeTabId === openTab.id) await Tabs.activate(openTab.id);
            }
        }

        UI.endTask(taskId, 'success', `Manifested ${changeList.length} files.`);
        for (const p of parentsToRefresh) {
            await Workspaces.refreshNode({ ...workspace, path: p, kind: 'directory', workspaceId, type: physicalType });
        }
    },
    
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
