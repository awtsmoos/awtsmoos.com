
// B"H
/**
 * @file LoopEngine.js
 * @brief The Physical Hand of the Vibe System. Writes confirmed vessels to disk.
 */

import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces/index.js';
import { UI } from '../../ui.js';
import { GitMetaProvider } from '../../git/meta.js';

export const LoopEngine = {
    /**
     * @async
     * @function apply
     * @description Writes a list of changes to the physical disk and stages them for Git.
     */
    async apply(changeList, workspaceId) {
        if (!changeList || changeList.length === 0) return;

        const workspace = State.workspaces.find(ws => String(ws.id) === String(workspaceId));
        if (!workspace) {
            console.error(`[LoopEngine] B"H - Workspace ${workspaceId} not found.`);
            return;
        }
        
        const physicalType = workspace.originalType || workspace.type;
        const parentsToRefresh = new Set();
        
        for (let i = 0; i < changeList.length; i++) {
            const change = changeList[i];
            const fileName = change.path.split('/').pop() || "vessel";
            const taskId = `vibe-apply-${Date.now()}-${i}`;
            
            UI.startTask(taskId, `Writing: ${fileName}`);
            UI.updateTask(taskId, 50, `Manifesting ${fileName}...`);
            
            const item = { 
                ...workspace, 
                path: change.path, 
                kind: 'file', 
                workspaceId: workspaceId, 
                type: physicalType,
                originalType: physicalType
            };

            // --- Git Staging Ritual ---
            try {
                const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
                if (gitInfo) {
                    const gitRoot = gitInfo.path.replace(/\/+$/, "") || "/";
                    let relToGit = change.path;
                    if (gitRoot !== "/" && relToGit.startsWith(gitRoot + "/")) {
                        relToGit = relToGit.substring(gitRoot.length + 1);
                    } else if (gitRoot === "/") {
                        relToGit = relToGit.startsWith("/") ? relToGit.substring(1) : relToGit;
                    }

                    if (relToGit) {
                        const stagingKey = `${workspaceId}::${relToGit}`;
                        if (change.operation === 'delete') {
                            await FileSystemProvider.IndexedDB.writeUncommitted(stagingKey, null, { ...item, path: relToGit });
                        } else {
                            await FileSystemProvider.IndexedDB.writeUncommitted(stagingKey, change.content, { ...item, path: relToGit });
                        }
                    }
                }
            } catch (gitErr) {
                console.warn("[LoopEngine] Git Staging skipped:", gitErr.message);
            }

            // --- Physical Manifestation Ritual ---
            try {
                if (change.operation === 'delete') {
                    await FileSystemProvider.delete(item);
                } else {
                    await this._ensureDirectoryExists(workspace, change.path, physicalType);
                    await FileSystemProvider.write(item, change.content);
                }

                const lastSlash = change.path.lastIndexOf('/');
                const parentPath = lastSlash <= 0 ? "/" : change.path.substring(0, lastSlash);
                parentsToRefresh.add(parentPath);

                UI.endTask(taskId, 'success', `B"H - ${fileName} Manifested.`);

            } catch (err) {
                console.error(`[LoopEngine] B"H - Manifestation failed for ${change.path}:`, err);
                UI.endTask(taskId, 'error', `Failed: ${fileName}`);
            }
            
            // --- Live Tab Synchronization ---
            const openTab = State.tabs.find(t => t.item.path === change.path && String(t.item.workspaceId) === String(workspaceId));
            if (openTab) {
                openTab.content = change.content;
                openTab.isDirty = false;
                openTab.isUncommitted = true;
                if (State.activeTabId === openTab.id) {
                    const { Editor } = await import('../../editor.js');
                    if (Editor && Editor.setCurrentContent) {
                        Editor.setCurrentContent(change.content);
                    }
                }
            }
        }

        // Refresh folders to show new files
        for (const p of parentsToRefresh) {
            await Workspaces.refreshNode({ ...workspace, path: p, kind: 'directory', workspaceId, type: physicalType });
        }
        
        // Re-render tab bar for status indicators
        const { Tabs } = await import('../../tabs/index.js');
        if (Tabs && Tabs.render) Tabs.render();
    },
    
    /**
     * @private
     * @async
     * @function _ensureDirectoryExists
     * @description Ensures the physical path exists before writing a file.
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
                const item = { ...workspace, path: currentPath, kind: 'directory', type: physicalType };
                await FileSystemProvider.list(item);
            } catch (e) {
                const parentItem = { ...workspace, path: parentPath, kind: 'directory', type: physicalType };
                await FileSystemProvider.create(parentItem, segment, 'directory');
            }
        }
    }
};
