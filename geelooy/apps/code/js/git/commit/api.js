// B"H
// FILE: js/git/commit/api.js
import { FileSystemProvider } from '../../fs-provider.js';

/**
 * --- COMMIT API ---
 * This holy vessel contains the direct, low-level incantations spoken to the GitHub API.
 * Each function is a specific creative act. B"H.
 */
export const CommitAPI = {
    /**
     * Manifests raw file content as GitHub Blobs, the "matter" of our codebase.
     * This is for existing repositories that already have a timeline.
     * @param {object} repoInfo - The coordinates of the repository in the higher planes (owner/repo).
     * @param {Array} blobBatch - An array of file objects with { path, content }.
     * @returns {Promise<Array>} A promise that resolves to an array of tree item objects for the commit.
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
     * Creates a new tree and commit, then updates or creates the branch reference.
     * This is for all standard updates to a repository's timeline.
     * @returns {Promise<string>} The SHA of the newly manifested reality (commit).
     */
    async executeCommit(repoInfo, branch, parentSHA, treeItems, message, force = false) {
        let treePayload = { tree: treeItems };
        
        if (parentSHA) {
            try {
                const parentCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits/${parentSHA}`);
                treePayload.base_tree = parentCommit.tree.sha;
            } catch (e) {
                console.warn("[Git] Parent tree not found, continuing with orphan root. A manifestation from the void.");
            }
        }

        const newTree = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
            method: 'POST', body: JSON.stringify(treePayload)
        });

        const commitBody = { 
            message, 
            tree: newTree.sha, 
            parents: parentSHA ? [parentSHA] : [] 
        };

        const newCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
            method: 'POST', body: JSON.stringify(commitBody)
        });
        
        try {
            await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs/heads/${branch}`, {
                method: 'PATCH', 
                body: JSON.stringify({ sha: newCommit.sha, force: force })
            });
        } catch (e) {
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
    },
    
    /**
     * B"H - The holy ritual for the Genesis Commit in a new, empty repository.
     * This is the act of "Let there be light" for a codebase. It creates the tree with inline content
     * to bypass the paradox of creating blobs in a void. This is the only way.
     * @returns {Promise<string>} The SHA of the Genesis commit.
     */
    async executeGenesisCommit(repoInfo, branch, filesToCreate, message) {
        const treeItems = filesToCreate.map(file => ({
            path: file.path,
            mode: '100644',
            type: 'blob',
            content: file.content
        }));

        const newTree = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
            method: 'POST', body: JSON.stringify({ tree: treeItems })
        });

        const commitBody = { 
            message, 
            tree: newTree.sha, 
            parents: [] 
        };

        const newCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
            method: 'POST', body: JSON.stringify(commitBody)
        });
        
        await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`, {
            method: 'POST',
            body: JSON.stringify({
                ref: `refs/heads/${branch}`,
                sha: newCommit.sha
            })
        });

        return newCommit.sha;
    }
};
