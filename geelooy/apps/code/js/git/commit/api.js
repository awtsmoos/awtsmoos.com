// B"H
// FILE: js/git/commit/api.js
import { FileSystemProvider } from '../../fs-provider.js';

export const CommitAPI = {
    async uploadBlobs(repoInfo, blobBatch) {
        return await Promise.all(blobBatch.map(file => 
            FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs`, {
                method: 'POST',
                body: JSON.stringify({
                    content: FileSystemProvider.GitHub.utf8_to_b64(file.content),
                    encoding: 'base64'
                })
            }).then(blob => ({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha }))
        ));
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
    },
    
    async executeGenesis(repoInfo, branch, files, message) {
        const treeItems = files.map(f => ({ path: f.path, mode: '100644', type: 'blob', content: f.content }));
        const tree = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
            method: 'POST', body: JSON.stringify({ tree: treeItems })
        });
        const commit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
            method: 'POST', body: JSON.stringify({ message, tree: tree.sha, parents: [] })
        });
        await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`, {
            method: 'POST', body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha })
        });
        return commit.sha;
    }
};
