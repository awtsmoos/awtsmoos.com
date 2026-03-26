
// B"H
/**
 * @file branching.js
 * @brief The Project Timestream Architect.
 */

import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from './index.js';
import { Tabs } from '../tabs/index.js';

export const BranchManager = {
    /**
     * @async
     * @function switchBranch
     * @description Instantaneously shifts the reality of a workspace. 
     * It stores current uncommitted work under a branch-specific prefix in IndexedDB.
     */
    async switchBranch(workspaceId, newBranchName) {
        const ws = State.workspaces.find(w => String(w.id) === String(workspaceId));
        if (!ws) return;

        const oldBranch = ws.currentBranch || 'main';
        if (oldBranch === newBranchName) return;

        const taskId = `branch-${Date.now()}`;
        UI.startTask(taskId, `Shifting to branch: ${newBranchName}`);

        try {
            // 1. Gather all current uncommitted sparks belonging to this world
            const currentUncommitted = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
            
            // 2. Transmute them to the "Old Branch" prefix for safe keeping
            for (const entry of currentUncommitted) {
                const branchKey = `branch::${oldBranch}::${entry.uniquePath}`;
                await FileSystemProvider.IndexedDB.writeUncommitted(branchKey, entry.content, entry.item);
                await FileSystemProvider.IndexedDB.deleteUncommitted(entry.uniquePath);
            }

            // 3. Restore work from the "New Branch" if it exists in deep memory
            const prefix = `branch::${newBranchName}::${workspaceId}::`;
            const db = await FileSystemProvider.IndexedDB.init();
            const tx = db.transaction(FileSystemProvider.IndexedDB.GIT_STORE_NAME, "readwrite");
            const store = tx.objectStore(FileSystemProvider.IndexedDB.GIT_STORE_NAME);
            
            // Search for keys starting with the branch prefix
            const request = store.openCursor(IDBKeyRange.bound(prefix, prefix + '\uffff'));
            
            request.onsuccess = async (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    const oldKey = cursor.key;
                    const cleanUniquePath = oldKey.replace(`branch::${newBranchName}::`, '');
                    
                    // Manifest back into active uncommitted reality
                    await FileSystemProvider.IndexedDB.writeUncommitted(cleanUniquePath, cursor.value.content, cursor.value.item);
                    await store.delete(oldKey); // Purge from branch storage after restoring
                    cursor.continue();
                } else {
                    // Finalize UI
                    ws.currentBranch = newBranchName;
                    UI.endTask(taskId, 'success', `Switched to ${newBranchName}`);
                    
                    // Refresh open tabs to reflect restored branch state
                    State.tabs.forEach(t => {
                        if (String(t.item.workspaceId) === String(workspaceId)) {
                            t.forceReload = true;
                        }
                    });
                    
                    await Workspaces.render();
                    Tabs.render();
                }
            };

        } catch (e) {
            UI.endTask(taskId, 'error', `Branch shift failed: ${e.message}`);
        }
    }
};
