
// B"H
import { FileSystemProvider } from '../../fs-provider.js';

export const CommitAPI = {
    /**
     * @async
     * @function uploadBlobs
     * @description Sequentially uploads file contents as blobs to GitHub. 
     * Uses a small delay between each to respect secondary rate limits.
     */
    async uploadBlobs(repoInfo, blobBatch, onFileProgress) {
        const results = [];
        for (const file of blobBatch) {
            if (onFileProgress) onFileProgress(file.path);
            
            const blob = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs`, {
                method: 'POST',
                body: JSON.stringify({
                    content: FileSystemProvider.GitHub.utf8_to_b64(file.content),
                    encoding: 'base64'
                })
            });
            
            results.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
            
            // B"H - The "Small Rest": Mandatory 150ms delay between individual blob creations
            // to stay under the GitHub secondary rate limit radar.
            await new Promise(r => setTimeout(r, 150));
        }
        return results;
    },

    async executeCommit(repoInfo, branch, parentSHA, treeItems, message, force = false) {
        let treePayload = { tree: treeItems };
        if (parentSHA) {
            try {
                const parent = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits/${parentSHA}`);
                treePayload.base_tree = parent.tree.sha;
            } catch (e) {}
        }

        const newTree = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
            method: 'POST', body: JSON.stringify(treePayload)
        });

        const newCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
            method: 'POST', body: JSON.stringify({ message, tree: newTree.sha, parents: parentSHA ? [parentSHA] : [] })
        });
        
        const refPath = `/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs/heads/${branch}`;
        try {
            await FileSystemProvider.GitHub.api(refPath, { method: 'PATCH', body: JSON.stringify({ sha: newCommit.sha, force }) });
        } catch (e) {
            await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`, {
                method: 'POST', body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: newCommit.sha })
            });
        }
        return newCommit.sha;
    }
};
