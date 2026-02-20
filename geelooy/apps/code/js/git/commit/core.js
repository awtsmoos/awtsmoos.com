// B"H
// FILE: js/git/commit/core.js
import { FileSystemProvider } from '../../fs-provider.js';
import { UI } from '../../ui.js';
import { CommitAPI } from './api.js';
import { CommitState } from './state.js';

/**
 * --- GIT COMMIT CORE ---
 * This vessel is the Divine Chariot for manifesting changes. It understands patience,
 * breaking down large creative acts into smaller, respectful steps to honor the
 * rhythm of the cosmos (and GitHub's rate limits). B"H.
 */
export const GitCommit = {
    /**
     * B"H - Performs a multi-phase Git commit, now with chunking for rate-limit safety.
     * This is the primary function for all standard (non-genesis) commits.
     * @param {object} gitContextItem - The root of the repository being committed to.
     * @param {object} gitInfo - The metadata of the repository.
     * @param {object} changeSet - The collection of creations, updates, and deletions.
     * @param {string} commitMessage - The holy words describing the manifestation.
     * @param {object} options - Additional options, like 'force'.
     * @returns {Promise<string>} The SHA of the final commit in the sequence.
     */
    async performCommit(gitContextItem, gitInfo, changeSet, commitMessage, options = {}) {
        const { repoInfo, branch } = gitInfo;
        const force = options.force || false;
        const taskId = `commit-${Date.now()}`;
        const CHUNK_SIZE = 50; // A respectful number of files to process at once.
        
        UI.startTask(taskId, `Manifesting to ${repoInfo.repo}...`);
        
        const uploads = [...(changeSet.creations || []), ...(changeSet.updates || [])];
        const deletions = changeSet.deletions || [];
        
        let parentSHA = null;
        if (!force) {
            parentSHA = await FileSystemProvider.GitHub.getLatestCommitSHA({ repoInfo, branch });
        }

        try {
            let currentSHA = parentSHA;
            
            // --- Phase 1: Uploading Blobs and Updating Tree in Chunks ---
            for (let i = 0; i < uploads.length; i += CHUNK_SIZE) {
                const chunk = uploads.slice(i, i + CHUNK_SIZE);
                UI.updateTask(taskId, 30 + (i / uploads.length * 40), `Uploading vessel chunk ${i / CHUNK_SIZE + 1}...`);
                
                const treeItems = await CommitAPI.uploadBlobs(repoInfo, chunk);
                currentSHA = await CommitAPI.executeCommit(repoInfo, branch, currentSHA, treeItems, commitMessage, force);
                await CommitState.saveIncremental(gitContextItem, gitInfo, currentSHA, chunk, [], treeItems);
                
                // B"H - A moment of respectful silence.
                if (uploads.length > CHUNK_SIZE) await new Promise(res => setTimeout(res, 1000));
            }

            // --- Phase 2: Processing Deletions in Chunks ---
            for (let i = 0; i < deletions.length; i += CHUNK_SIZE) {
                const chunk = deletions.slice(i, i + CHUNK_SIZE);
                UI.updateTask(taskId, 70 + (i / deletions.length * 30), `Purging node chunk ${i / CHUNK_SIZE + 1}...`);
                
                const deleteItems = chunk.map(d => ({ path: d.path, mode: '100644', type: 'blob', sha: null }));
                currentSHA = await CommitAPI.executeCommit(repoInfo, branch, currentSHA, deleteItems, commitMessage + " (Cleanup)", force);
                await CommitState.saveIncremental(gitContextItem, gitInfo, currentSHA, [], chunk, deleteItems);

                if (deletions.length > CHUNK_SIZE) await new Promise(res => setTimeout(res, 1000));
            }

            UI.endTask(taskId, 'success', 'B"H: Manifestation complete.');
            return currentSHA;
        } catch (e) {
            UI.endTask(taskId, 'error', e.message);
            throw e;
        }
    }
};
