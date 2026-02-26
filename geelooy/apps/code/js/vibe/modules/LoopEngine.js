
// B"H
/**
 * @file LoopEngine.js
 * @brief The Physical Hand of the Vibe System.
 */

import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces/index.js';
import { UI } from '../../ui.js';
import { GitMetaProvider } from '../../git/meta.js';

export const LoopEngine = {
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
            
            const item = { 
                ...workspace, 
                path: change.path, 
                kind: 'file', 
                workspaceId: workspaceId, 
                type: physicalType,
                originalType: physicalType
            };

            // --- Git Staging Ritual ---
            const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
            if (gitInfo) {
                const gitRootPath = gitInfo.path.replace(/\/+$/, "") || "/";
                let relToGit = change.path;

                // B"H - Precise normalization for Staging
                if (gitRootPath !== "/" && gitRootPath !== "") {
                    if (change.path.startsWith(gitRootPath + "/")) {
                        relToGit = change.path.substring(gitRootPath.length + 1);
                    } else if (change.path === gitRootPath) {
                        relToGit = "";
                    }
                } else {
                    relToGit = change.path.startsWith("/") ? change.path.substring(1) : change.path;
                }

                if (relToGit) {
                    const uniqueStagingKey = `${workspaceId}::${relToGit}`;
                    if (change.operation === 'delete') {
                        await FileSystemProvider.IndexedDB.writeUncommitted(uniqueStagingKey, null, { ...item, path: relToGit });
                    } else {
                        await FileSystemProvider.IndexedDB.writeUncommitted(uniqueStagingKey, change.content, { ...item, path: relToGit });
                    }
                }
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
                    import('../../editor.js').then(m => m.Editor.setCurrentContent(change.content));
                }
            }
        }

        UI.endTask(taskId, 'success', `B"H - Manifested ${changeList.length} vessels.`);

        for (const p of parentsToRefresh) {
            await Workspaces.refreshNode({ ...workspace, path: p, kind: 'directory', workspaceId, type: physicalType });
        }
        
        // Re-render tabs to show uncommitted dots
        import('../../tabs/index.js').then(m => m.Tabs.render());
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
                const item = { ...workspace, path: currentPath, kind: 'directory', type: physicalType };
                await FileSystemProvider.list(item);
            } catch (e) {
                const parentItem = { ...workspace, path: parentPath, kind: 'directory', type: physicalType };
                await FileSystemProvider.create(parentItem, segment, 'directory');
            }
        }
    }
};
