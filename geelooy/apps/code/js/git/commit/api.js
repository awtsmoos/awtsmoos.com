// B"H
// FILE: js/git/commit/api.js
import { FileSystemProvider } from '../../fs-provider.js';

export const CommitAPI = {
    /**
     * B"H - Uploads raw file content as GitHub Blobs.
     */
    async uploadBlobs(repoInfo, blobBatch) {
        return await Promise.all(blobBatch.map(file => 
            FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs`, {
                method: 'POST',
                body: JSON.stringify({
                    content: FileSystemProvider.GitHub.utf8_to_b64(file.content),
                    encoding: 'base64'
                })
            }).then(blob => ({
                path: file.path,
                mode: '100644',
                type: 'blob',
                sha: blob.sha
            }))
        ));
    },

    /**
     * B"H - Creates a new tree and commit, then updates/creates the branch reference.
     * Correctly handles the transition from empty repo (Genesis) to active repo.
     */
    async executeCommit(repoInfo, branch, parentSHA, treeItems, message, force = false) {
        let treePayload = { tree: treeItems };
        
        if (parentSHA) {
            try {
                const parentCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits/${parentSHA}`);
                treePayload.base_tree = parentCommit.tree.sha;
            } catch (e) {
                console.warn("[Git] Parent tree not found, continuing with orphan root.");
            }
        }

        // 1. Forge the Tree
        const newTree = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
            method: 'POST', body: JSON.stringify(treePayload)
        });

        // 2. Form the Commit
        const commitBody = { 
            message, 
            tree: newTree.sha, 
            parents: parentSHA ? [parentSHA] : [] 
        };

        const newCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
            method: 'POST', body: JSON.stringify(commitBody)
        });
        
        // 3. Manifest the Reference
        try {
            // First attempt: Update existing branch
            await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs/heads/${branch}`, {
                method: 'PATCH', 
                body: JSON.stringify({ sha: newCommit.sha, force: force })
            });
        } catch (e) {
            // B"H - Genesis Recovery: If PATCH fails because branch is missing, create it via POST.
            const msg = e.message.toLowerCase();
            if (msg.includes('404') || msg.includes('409') || msg.includes('not found') || msg.includes('empty')) {
                await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`, {
                    method: 'POST',
                    body: JSON.stringify({
                        ref: `refs/heads/${branch}`,
                        sha: newCommit.sha
                    })
                });
            } else {
                throw e;
            }
        }

        return newCommit.sha;
    }
};