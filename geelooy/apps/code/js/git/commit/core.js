// B"H
// FILE: js/git/commit/core.js
import { FileSystemProvider } from '../../fs-provider.js';
import { UI } from '../../ui.js';
import { CommitAPI } from './api.js';
import { CommitState } from './state.js';

export const GitCommit = {
    /**
     * B"H - Performs a multi-phase Git commit.
     */
    async performCommit(gitContextItem, gitInfo, changeSet, commitMessage, options = {}) {
        const { repoInfo, branch } = gitInfo;
        const force = options.force || false;
        const taskId = `commit-${Date.now()}`;
        
        UI.startTask(taskId, `Manifesting to ${repoInfo.repo}...`);
        
        const uploads = [...(changeSet.creations || []), ...(changeSet.updates || [])];
        const deletions = changeSet.deletions || [];
        
        // 1. Determine parent reality
        let parentSHA = null;
        if (!force) {
            parentSHA = await FileSystemProvider.GitHub.getLatestCommitSHA({ repoInfo, branch });
        }

        try {
            let currentSHA = parentSHA;
            
            // 2. Phase 1: Uploading Blobs and Updating Tree
            if (uploads.length > 0) {
                UI.updateTask(taskId, 30, "Uploading vessels...");
                const treeItems = await CommitAPI.uploadBlobs(repoInfo, uploads);
                currentSHA = await CommitAPI.executeCommit(repoInfo, branch, currentSHA, treeItems, commitMessage, force);
                await CommitState.saveIncremental(gitContextItem, gitInfo, currentSHA, uploads, [], treeItems);
            }

            // 3. Phase 2: Processing Deletions
            if (deletions.length > 0) {
                UI.updateTask(taskId, 70, "Purging nodes...");
                const deleteItems = deletions.map(d => ({ path: d.path, mode: '100644', type: 'blob', sha: null }));
                currentSHA = await CommitAPI.executeCommit(repoInfo, branch, currentSHA, deleteItems, commitMessage + " (Cleanup)", force);
                await CommitState.saveIncremental(gitContextItem, gitInfo, currentSHA, [], deletions, deleteItems);
            }

            UI.endTask(taskId, 'success', 'B"H: Manifestation complete.');
            return currentSHA;
        } catch (e) {
            UI.endTask(taskId, 'error', e.message);
            throw e;
        }
    }
};