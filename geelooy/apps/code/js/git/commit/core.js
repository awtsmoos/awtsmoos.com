
// B"H
import { FileSystemProvider } from '../../fs-provider.js';
import { UI } from '../../ui.js';
import { CommitAPI } from './api.js';
import { CommitState } from './state.js';

export const GitCommit = {
    async performCommit(gitContextItem, gitInfo, changeSet, commitMessage, options = {}) {
        const { repoInfo, branch } = gitInfo;
        const taskId = `commit-${Date.now()}`;
        // B"H - Reduced chunk size for increased stability
        const CHUNK = 10; 
        
        UI.startTask(taskId, `Manifesting to GitHub...`);
        const uploads = [...(changeSet.creations || []), ...(changeSet.updates || [])];
        const deletions = changeSet.deletions || [];
        const totalFiles = uploads.length + deletions.length;
        
        let currentSHA = options.force ? null : await FileSystemProvider.GitHub.getLatestCommitSHA({ repoInfo, branch });

        try {
            for (let i = 0; i < uploads.length; i += CHUNK) {
                const chunk = uploads.slice(i, i + CHUNK);
                const chunkNum = Math.floor(i/CHUNK) + 1;
                
                const items = await CommitAPI.uploadBlobs(repoInfo, chunk, (fileName) => {
                    const progress = ((i + chunk.indexOf(chunk.find(f => f.path === fileName))) / totalFiles) * 100;
                    UI.updateTask(taskId, progress, `[${chunkNum}] Writing: ${fileName.split('/').pop()}`);
                });

                currentSHA = await CommitAPI.executeCommit(repoInfo, branch, currentSHA, items, commitMessage, options.force);
                await CommitState.saveIncremental(gitContextItem, gitInfo, currentSHA, chunk, [], items);
                
                // Pause to let the API cool down
                await new Promise(r => setTimeout(r, 1000));
            }

            for (let i = 0; i < deletions.length; i += CHUNK) {
                const chunk = deletions.slice(i, i + CHUNK);
                UI.updateTask(taskId, ((uploads.length + i) / totalFiles) * 100, `Purging deletions...`);
                const items = chunk.map(d => ({ path: d.path, mode: '100644', type: 'blob', sha: null }));
                currentSHA = await CommitAPI.executeCommit(repoInfo, branch, currentSHA, items, commitMessage + " (Cleanup)", options.force);
                await CommitState.saveIncremental(gitContextItem, gitInfo, currentSHA, [], chunk, items);
            }

            UI.endTask(taskId, 'success', 'B"H: Manifestation Complete.');
            return currentSHA;
        } catch (e) { 
            UI.endTask(taskId, 'error', `Manifestation Blocked: ${e.message}`); 
            throw e; 
        }
    }
};
