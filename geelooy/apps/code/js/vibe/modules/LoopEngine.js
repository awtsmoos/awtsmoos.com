// B"H
// FILE: js/vibe/modules/LoopEngine.js

import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces.js';
import { UI } from '../../ui.js';
import { Tabs } from '../../tabs/index.js';
import { PromptShaper } from './PromptShaper.js';

export const LoopEngine = {
    /**
     * B"H - Physically manifests changes into the disk vessels.
     */
    async apply(changeList, workspaceId) {
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        if (!workspace) {
            console.error(`[LoopEngine] Workspace ID ${workspaceId} not found in state.`);
            return;
        }
        
        // Extract the true physical type (crucial for virtual vibe sessions)
        const physicalType = workspace.originalType || workspace.type;
        const parentsToRefresh = new Set();

        for (let i = 0; i < changeList.length; i++) {
            const change = changeList[i];
            
            // Construct the absolute path object required by the FS Provider
            const item = { 
                ...workspace, 
                path: change.path, 
                kind: 'file', 
                workspaceId: workspaceId, 
                type: physicalType,
                originalType: physicalType
            };

            if (change.operation === 'delete') {
                try {
                    console.log(`[LoopEngine] Deleting vessel: ${change.path}`);
                    await FileSystemProvider.delete(item);
                } catch (delErr) {
                    // B"H - If the file is already gone, our goal is achieved. Ignore the error.
                    if (delErr.name === 'NotFoundError' || (delErr.message && delErr.message.toLowerCase().includes('not found'))) {
                        console.log(`[LoopEngine] Vessel already deleted or not found: ${change.path}`);
                    } else {
                        console.error(`[LoopEngine Error] Failed to delete ${change.path}`, delErr);
                        UI.showToast(`Failed to delete ${change.path.split('/').pop()}`, "error");
                    }
                }
            } else {
                try {
                    // Before writing, we must ensure the path's directory exists
                    await this._ensureDirectoryExists(workspace, change.path, physicalType);
                    
                    console.log(`[LoopEngine] Writing essence to: ${change.path}`);
                    await FileSystemProvider.write(item, change.content);
                } catch (writeErr) {
                    // B"H - If standard write throws NotFound (common in some browser edge cases),
                    // we perform an absolute fallback: explicitly create the file first, then write.
                    if (writeErr.name === 'NotFoundError' || (writeErr.message && writeErr.message.toLowerCase().includes('not found'))) {
                        console.log(`[LoopEngine] Write threw NotFound, attempting explicit file creation: ${change.path}`);
                        try {
                            const parts = change.path.split('/');
                            const fileName = parts.pop();
                            const parentP = parts.join('/') || '/';
                            
                            const parentDirItem = { ...workspace, path: parentP, kind: 'directory', type: physicalType, originalType: physicalType };
                            await FileSystemProvider.create(parentDirItem, fileName, 'file');
                            await FileSystemProvider.write(item, change.content);
                            console.log(`[LoopEngine] Fallback write successful for: ${change.path}`);
                        } catch (fallbackErr) {
                            this._logCriticalError(change, fallbackErr);
                        }
                    } else {
                        this._logCriticalError(change, writeErr);
                    }
                }
            }
            
            // Keep track of the parent folder to refresh the UI tree later
            const lastSlash = change.path.lastIndexOf('/');
            const parentPath = lastSlash <= 0 ? '/' : change.path.substring(0, lastSlash);
            parentsToRefresh.add(parentPath);
            
            // If the user currently has this file open in a tab, update it live
            const openTab = State.tabs.find(t => t.item.path === change.path && t.item.workspaceId === workspaceId);
            if (openTab) {
                openTab.content = change.content;
                openTab.forceReload = true;
                // Only re-activate if it is the currently visible tab
                if (State.activeTabId === openTab.id) {
                    await Tabs.activate(openTab.id);
                }
            }
        }

        // Refresh the UI tree for all affected folders
        for (const p of parentsToRefresh) {
            await Workspaces.refreshNode({ 
                ...workspace, 
                path: p, 
                kind: 'directory', 
                workspaceId: workspaceId, 
                type: physicalType 
            });
        }
    },
    
    _logCriticalError(change, error) {
        const shortPath = change.path.split('/').pop();
        const errorMessage = `B"H - Manifestation of '${shortPath}' failed. The vessel could not be shaped.`;
        console.error(`[LoopEngine Error] ${errorMessage}`, "\nPath:", change.path, "\nException:", error);
        UI.showToast(errorMessage, "error", 5000); 
    },

    /**
     * B"H - Recursive Directory Stabilizer.
     * Walks the path and creates missing vessels.
     */
    async _ensureDirectoryExists(workspace, filePath, physicalType) {
        const segments = filePath.split('/').filter(Boolean);
        if (segments.length <= 1) return; // File is in root, no folders to create.

        segments.pop(); // Remove the filename, leaving only directories

        let currentPath = "";
        
        for (const segment of segments) {
            const parentPath = currentPath || "/";
            currentPath += "/" + segment;

            try {
                // Try to list the directory. Throws NotFoundError if it doesn't exist.
                await FileSystemProvider.list({ 
                    ...workspace, 
                    path: currentPath, 
                    kind: 'directory', 
                    type: physicalType,
                    originalType: physicalType
                });
            } catch (e) {
                if (e.name === 'NotFoundError' || (e.message && e.message.toLowerCase().includes('not found'))) {
                    console.log(`[LoopEngine] Creating missing directory vessel: ${currentPath}`);
                    // We intentionally DO NOT catch inside this block. 
                    // If creation fails, the loop throws, which is caught by apply().
                    await FileSystemProvider.create(
                        { 
                            ...workspace, 
                            path: parentPath, 
                            kind: 'directory', 
                            type: physicalType,
                            originalType: physicalType
                        },
                        segment,
                        'directory'
                    );
                } else {
                    // It failed to list for a DIFFERENT reason (permissions, etc.)
                    throw e; 
                }
            }
        }
    },

    /**
     * B"H - Decides whether to continue the refinement loop.
     */
    async handleIteration(tab, controller) {
        if (State.isVibeStopRequested) {
            UI.showToast("B\"H: Loop stopped by command.", "info");
            tab.vibeSession.isProcessing = false;
            controller.syncUI(tab);
            return;
        }

        if (tab.vibeSession.iterationCount < State.vibeIterations) {
            tab.vibeSession.iterationCount++;
            UI.showToast(`B"H: Refining (Loop ${tab.vibeSession.iterationCount}/${State.vibeIterations})...`, "success");
            await controller.triggerGeneration(tab, PromptShaper.getOptimization(), true);
        } else {
            UI.showToast("B\"H: The Tikkun is complete.", "success");
            tab.vibeSession.isProcessing = false;
            controller.syncUI(tab);
        }
    }
};