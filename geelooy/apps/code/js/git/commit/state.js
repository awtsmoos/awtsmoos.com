
// B"H
// FILE: js/git/commit/state.js
import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';
import { MetadataRituals } from './metadata-rituals.js';

/**
 * @class CommitState
 * @description The witness of the Tikkun. 
 * 
 * THE POEM OF THE WITNESS:
 * When the heavens accept the rectification (GitHub commit),
 * the earthly scroll must also be revised.
 * We update the tree, clear the uncommitted sparks,
 * and ensure the tabs reflect the new, holier state.
 */
export const CommitState = {
    /**
     * @function saveIncremental
     * @description B"H. Orchestrates the local state update after a remote commit.
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

        // Update local anchor only if we are in a physical local-copy world
        if (gitContextItem.type !== 'github') {
            await MetadataRituals.updateLocalAnchor(gitContextItem, gitInfo, newCommitSHA);
        }

        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;
        await this.clearUncommitted(workspaceId, {
            creations: processedFiles, updates: [], deletions: processedDeletions
        }, committedTreeMap);
    },

    async clearUncommitted(workspaceId, changeSet, committedTreeMap) {
        const all = [...(changeSet.creations || []), ...(changeSet.updates || []), ...(changeSet.deletions || [])];
        
        await Promise.all(all.map(async (change) => {
            const relPath = change.path;
            const uniquePath = `${workspaceId}::${relPath}`;
            
            // Re-manifest the state of any open tabs
            const tab = State.tabs.find(t => t.item.path.includes(relPath) && t.item.workspaceId === workspaceId);
            if (tab && committedTreeMap.has(relPath)) {
                tab.isDirty = false;
                tab.isUncommitted = false;
                tab.item.sha = committedTreeMap.get(relPath).sha;
            }
            return FileSystemProvider.IndexedDB.deleteUncommitted(uniquePath);
        }));

        import('../../tabs/index.js').then(m => m.Tabs.render());
    }
};
