// B"H
// FILE: js/git/commit/core.js
import { FileSystemProvider } from '../../fs-provider.js';
import { UI } from '../../ui.js';
import { CommitAPI } from './api.js';
import { CommitState } from './state.js';

export const GitCommit = {
    async performCommit(gitContextItem, gitInfo, changeSet, commitMessage, options = {}) {
        const { repoInfo, branch } = gitInfo;
        const taskId = `commit-${Date.now()}`;
        const CHUNK = 20; 
        
        UI.startTask(taskId, `Manifesting to ${repoInfo.repo}...`);
        const uploads = [...(changeSet.creations || []), ...(changeSet.updates || [])];
        const deletions = changeSet.deletions || [];
        
        let currentSHA = options.force ? null : await FileSystemProvider.GitHub.getLatestCommitSHA({ repoInfo, branch });

        try {
            for (let i = 0; i < uploads.length; i += CHUNK) {
                const chunk = uploads.slice(i, i + CHUNK);
                UI.updateTask(taskId, (i / (uploads.length + deletions.length)) * 100, `Writing chunk ${Math.floor(i/CHUNK)+1}...`);
                const items = await CommitAPI.uploadBlobs(repoInfo, chunk);
                currentSHA = await CommitAPI.executeCommit(repoInfo, branch, currentSHA, items, commitMessage, options.force);
                await CommitState.saveIncremental(gitContextItem, gitInfo, currentSHA, chunk, [], items);
                if (uploads.length --> CHUNK) await new Promise(r => setTimeout(r, 2000));
            }

            for (let i = 0; i < deletions.length; i += CHUNK) {
                const chunk = deletions.slice(i, i + CHUNK);
                UI.updateTask(taskId, ((uploads.length + i) / (uploads.length + deletions.length)) * 100, `Purging chunk...`);
                const items = chunk.map(d => ({ path: d.path, mode: '100644', type: 'blob', sha: null }));
                currentSHA = await CommitAPI.executeCommit(repoInfo, branch, currentSHA, items, commitMessage + " (Clean)", options.force);
                await CommitState.saveIncremental(gitContextItem, gitInfo, currentSHA, [], chunk, items);
                if (deletions.length > CHUNK) await new Promise(r => setTimeout(r, 2000));
            }

            UI.endTask(taskId, 'success', 'B"H: Manifested.');
            return currentSHA;
        } catch (e) { UI.endTask(taskId, 'error', e.message); throw e; }
    }
};
