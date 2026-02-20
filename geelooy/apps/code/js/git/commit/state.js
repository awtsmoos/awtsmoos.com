// B"H
// FILE: js/git/commit/state.js
import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';
import { Tabs } from '../../tabs/index.js';

export const CommitState = {
    /**
     * B"H - Updates local metadata and UI state after a successful remote commit.
     */
    async saveIncremental(gitContextItem, gitInfo, newCommitSHA, processedFiles = [], processedDeletions = [], treeItems = []) {
        gitInfo.baseCommitSHA = newCommitSHA;
        if (!gitInfo.remoteTree) gitInfo.remoteTree = [];

        const treeMap = new Map(gitInfo.remoteTree.map(item => [item.path, item]));
        const committedTreeMap = new Map();

        treeItems.forEach(newItem => {
            if (newItem.sha === null) {
                treeMap.delete(newItem.path);
            } else {
                const itemData = { path: newItem.path, mode: '100644', type: 'blob', sha: newItem.sha };
                treeMap.set(newItem.path, itemData);
                committedTreeMap.set(newItem.path, itemData); 
            }
        });

        gitInfo.remoteTree = Array.from(treeMap.values());

        // Update local ikar.js if not a direct GitHub workspace
        if (gitContextItem.type !== 'github') {
            const ikarData = { ...gitInfo, baseCommitSHA: newCommitSHA, remoteTree: gitInfo.remoteTree };
            const root = gitContextItem.path.replace(/\/+$/, "");
            const ikarPath = `${root}/.awtsmoos-repo/ikar.js`;
            await FileSystemProvider.write({ ...gitContextItem, path: ikarPath }, `// B"H\nconst ikar = ${JSON.stringify(ikarData, null, 4)};`);
        }

        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;
        await this.clearUncommitted(gitContextItem, workspaceId, {
            creations: processedFiles, updates: [], deletions: processedDeletions
        }, committedTreeMap);
    },

    async clearUncommitted(gitContextItem, workspaceId, changeSet, committedTreeMap) {
        const all = [...(changeSet.creations || []), ...(changeSet.updates || []), ...(changeSet.deletions || [])];
        const promises = all.map(change => {
            const relPath = change.path;
            const uniquePath = `${workspaceId}::${relPath}`;
            
            // Sync open tabs
            const tab = State.tabs.find(t => t.item.path.includes(relPath) && t.item.workspaceId === workspaceId);
            if (tab && committedTreeMap.has(relPath)) {
                tab.isDirty = false;
                tab.isUncommitted = false;
                tab.item.sha = committedTreeMap.get(relPath).sha;
            }
            return FileSystemProvider.IndexedDB.deleteUncommitted(uniquePath);
        });
        await Promise.all(promises);
        Tabs.render();
    }
};