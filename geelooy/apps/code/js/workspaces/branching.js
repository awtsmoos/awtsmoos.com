
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
    async switchBranch(workspaceId, newBranchName) {
        const ws = State.workspaces.find(w => String(w.id) === String(workspaceId));
        if (!ws) return;

        const oldBranch = ws.currentBranch || 'main';
        if (oldBranch === newBranchName) return;

        const taskId = `branch-${Date.now()}`;
        UI.startTask(taskId, `Shifting reality to: ${newBranchName}`);

        try {
            // 1. Snapshot the "Current Now"
            const currentUncommitted = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
            
            // 2. Transmute uncommitted to branch storage
            for (const entry of currentUncommitted) {
                const branchKey = `branch::${oldBranch}::${entry.uniquePath}`;
                await FileSystemProvider.IndexedDB.writeUncommitted(branchKey, entry.content, entry.item);
                await FileSystemProvider.IndexedDB.deleteUncommitted(entry.uniquePath);
            }

            // 3. Reconstitute the "Next Now"
            const prefix = `branch::${newBranchName}::${workspaceId}::`;
            const db = await FileSystemProvider.IndexedDB.init();
            const tx = db.transaction(FileSystemProvider.IndexedDB.GIT_STORE_NAME, "readwrite");
            const store = tx.objectStore(FileSystemProvider.IndexedDB.GIT_STORE_NAME);
            
            const request = store.openCursor(IDBKeyRange.bound(prefix, prefix + '\uffff'));
            
            request.onsuccess = async (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    const cleanUniquePath = cursor.key.replace(`branch::${newBranchName}::`, '');
                    await FileSystemProvider.IndexedDB.writeUncommitted(cleanUniquePath, cursor.value.content, cursor.value.item);
                    await store.delete(cursor.key); 
                    cursor.continue();
                } else {
                    ws.currentBranch = newBranchName;
                    UI.endTask(taskId, 'success', `Awakened in ${newBranchName}`);
                    
                    // Force complete reload of files in this workspace
                    for (const tab of State.tabs) {
                        if (String(tab.item.workspaceId) === String(workspaceId)) {
                            tab.forceReload = true;
                            if (State.activeTabId === tab.id) await Tabs.activate(tab.id, true);
                        }
                    }
                    
                    await Workspaces.render();
                    Tabs.render();
                }
            };
        } catch (e) {
            UI.endTask(taskId, 'error', `Shevirah during branch shift: ${e.message}`);
        }
    }
};
