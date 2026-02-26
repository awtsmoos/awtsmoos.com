
// B"H
/**
 * @file LoopEngine.js
 * @brief The Physical Hand of the Vibe System.
 * 
 * POEM OF THE MANIFESTED WORD:
 * The voice commands the lightning, but the hand must hold the clay,
 * To turn the digital shadow into the light of day.
 * We write upon the silicon with a focus sharp and true,
 * Creating the old world's repairs and manifesting the new.
 * If the parent is missing, we speak the folder's name,
 * Establishing the structure within the cosmic frame.
 * We refresh the eyes of the system, so every spark is seen,
 * Keeping the connection between the user and machine.
 */

import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces/index.js';
import { UI } from '../../ui.js';
import { Tabs } from '../../tabs/index.js';
import { GitMetaProvider } from '../../git/meta.js';

export const LoopEngine = {
    /**
     * @async
     * @function apply
     * @description B"H - Physically manifests the AI's plans into the disk's reality.
     * @param {Array} changeList - The parsed rectifications.
     * @param {number} workspaceId - The anchor world for the changes.
     */
    async apply(changeList, workspaceId) {
        const workspace = State.workspaces.find(ws => String(ws.id) === String(workspaceId));
        if (!workspace) {
            console.error(`[LoopEngine] B"H - Fatal: Workspace ${workspaceId} not found.`);
            return;
        }
        
        const physicalType = workspace.originalType || workspace.type;
        const parentsToRefresh = new Set();
        
        const taskId = `vibe-apply-${Date.now()}`;
        UI.startTask(taskId, "B\"H - Manifesting Rectifications...");

        for (let i = 0; i < changeList.length; i++) {
            const change = changeList[i];
            const fileName = change.path.split('/').pop();
            
            UI.updateTask(taskId, (i / changeList.length) * 100, `Writing: ${fileName}`);
            
            // Build the fortified item object for the FS Provider
            const item = { 
                ...workspace, 
                path: change.path, 
                kind: 'file', 
                workspaceId: workspaceId, 
                type: physicalType,
                originalType: physicalType
            };

            console.log(`[LoopEngine] B"H - Manifesting: ${change.path} [Type: ${physicalType}]`);

            // --- Git Staging Ritual ---
            const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
            if (gitInfo) {
                const gitRootPath = gitInfo.path.replace(/\/+$/, "") || "/";
                let relToGit = change.path;

                if (gitRootPath !== "/" && change.path.startsWith(gitRootPath + "/")) {
                    relToGit = change.path.substring(gitRootPath.length + 1);
                } else if (gitRootPath === "/" || gitRootPath === "") {
                    relToGit = change.path.startsWith("/") ? change.path.substring(1) : change.path;
                }

                const uniqueStagingKey = `${workspaceId}::${relToGit}`;
                console.log(`[LoopEngine] B"H - Staging in Git memory: ${relToGit}`);
                
                if (change.operation === 'delete') {
                    await FileSystemProvider.IndexedDB.writeUncommitted(uniqueStagingKey, null, { ...item, path: relToGit });
                } else {
                    await FileSystemProvider.IndexedDB.writeUncommitted(uniqueStagingKey, change.content, { ...item, path: relToGit });
                }
            }

            // --- Physical Manifestation Ritual ---
            try {
                if (change.operation === 'delete') {
                    await FileSystemProvider.delete(item);
                } else {
                    // Ensure the ancestral chain of folders exists
                    await this._ensureDirectoryExists(workspace, change.path, physicalType);
                    
                    // The Sacred Inscription
                    await FileSystemProvider.write(item, change.content);
                }

                // Mark the parent for refreshing so the UI eyes see the new creation
                const lastSlash = change.path.lastIndexOf('/');
                const parentPath = lastSlash <= 0 ? "/" : change.path.substring(0, lastSlash);
                parentsToRefresh.add(parentPath);

            } catch (err) {
                console.error(`[LoopEngine] B"H - Manifestation Shevirah for ${change.path}:`, err);
                UI.showToast(`Failed to write ${fileName}: ${err.message}`, "error");
            }
            
            // --- Live Tab Synchronization ---
            const openTab = State.tabs.find(t => t.item.path === change.path && String(t.item.workspaceId) === String(workspaceId));
            if (openTab) {
                openTab.content = change.content;
                openTab.isDirty = false;
                openTab.isUncommitted = true;
                if (State.activeTabId === openTab.id) {
                    const { Editor } = await import('../../editor.js');
                    Editor.setCurrentContent(change.content);
                }
            }
        }

        UI.endTask(taskId, 'success', `B"H - Manifested ${changeList.length} vessels.`);

        // B"H - Trigger the Re-Perception ritual for all affected folders
        for (const p of parentsToRefresh) {
            await Workspaces.refreshNode({ ...workspace, path: p, kind: 'directory', workspaceId, type: physicalType });
        }
    },
    
    /**
     * @async
     * @function _ensureDirectoryExists
     * @description B"H - Recursively creates directory vessels if they are missing.
     */
    async _ensureDirectoryExists(workspace, filePath, physicalType) {
        const segments = filePath.split('/').filter(Boolean);
        if (segments.length <= 1) return;
        
        segments.pop(); // Remove the filename to get folder path
        let currentPath = "";
        
        for (const segment of segments) {
            const parentPath = currentPath || "/";
            currentPath += "/" + segment;
            
            try {
                // Check if directory exists
                const item = { ...workspace, path: currentPath, kind: 'directory', type: physicalType };
                await FileSystemProvider.list(item);
            } catch (e) {
                console.log(`[LoopEngine] B"H - Folder missing. Creating: ${currentPath}`);
                const parentItem = { ...workspace, path: parentPath, kind: 'directory', type: physicalType };
                await FileSystemProvider.create(parentItem, segment, 'directory');
            }
        }
    }
};
