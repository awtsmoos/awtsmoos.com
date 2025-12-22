// B"H
// FILE: code/js/git/git-commit.js
import { FileSystemProvider } from '../fs-provider.js';
import { State } from '../state.js';
import { UI } from '../ui.js';
import { Tabs } from '../tabs.js';

export const GitCommit = {
    async performCommit(gitContextItem, gitInfo, changeSet, commitMessage, options = {}) {
        const { repoInfo, branch } = gitInfo;
        const force = options.force || false;
        const taskId = `commit-${Date.now()}`;
        UI.startTask(taskId, `Committing to ${repoInfo.repo}...`);
        
        if (!gitInfo.remoteTree) gitInfo.remoteTree = [];

        const filesToUpload = [...(changeSet.creations || []), ...(changeSet.updates || [])];
        const filesToDelete = changeSet.deletions || [];
        const totalItems = filesToUpload.length + filesToDelete.length;
        
        const FILES_PER_COMMIT = 25; 
        const BLOB_BATCH_SIZE = 5;   

        let currentParentSHA = await FileSystemProvider.GitHub.getLatestCommitSHA({ repoInfo, branch });
        let commitCount = 1;
        let itemsProcessed = 0;
        const totalBatches = Math.ceil(filesToUpload.length / FILES_PER_COMMIT) + (filesToDelete.length > 0 ? 1 : 0);

        try {
            // --- 1. Processing Uploads ---
            while (filesToUpload.length > 0) {
                const currentBatchFiles = filesToUpload.splice(0, FILES_PER_COMMIT);
                const progressLabel = `Part ${commitCount}/${totalBatches}: Uploading...`;
                UI.updateTask(taskId, (itemsProcessed / totalItems) * 100);

                const treeItems = [];
                for (let i = 0; i < currentBatchFiles.length; i += BLOB_BATCH_SIZE) {
                    const blobBatch = currentBatchFiles.slice(i, i + BLOB_BATCH_SIZE);
                    const results = await Promise.all(blobBatch.map(file => 
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
                            sha: blob.sha,
                            _originalContent: file.content
                        }))
                    ));
                    treeItems.push(...results);
                    itemsProcessed += blobBatch.length;
                    UI.updateTask(taskId, (itemsProcessed / totalItems) * 100);
                }

                const messagePart = totalBatches > 1 ? ` (Part ${commitCount}/${totalBatches})` : '';
                const newCommitSHA = await this._executeGitCommit(
                    repoInfo, branch, currentParentSHA, treeItems, commitMessage + messagePart, force
                );

                await this._saveIncrementalState(gitContextItem, gitInfo, newCommitSHA, currentBatchFiles, [], treeItems);
                currentParentSHA = newCommitSHA;
                commitCount++;
            }

            // --- 2. Process Deletions ---
            if (filesToDelete.length > 0) {
                const treeItems = filesToDelete.map(file => ({
                    path: file.path, mode: '100644', type: 'blob', sha: null
                }));

                const newCommitSHA = await this._executeGitCommit(
                    repoInfo, branch, currentParentSHA, treeItems, commitMessage + " (Deletions)", force
                );

                await this._saveIncrementalState(gitContextItem, gitInfo, newCommitSHA, [], filesToDelete, treeItems);
                currentParentSHA = newCommitSHA;
            }

            UI.endTask(taskId, 'success', 'Changes pushed successfully.');
            return currentParentSHA;

        } catch (e) {
            UI.endTask(taskId, 'error', `Commit failed: ${e.message}`);
            throw e;
        }
    },

    async _saveIncrementalState(gitContextItem, gitInfo, newCommitSHA, processedFiles = [], processedDeletions = [], treeItems = []) {
        gitInfo.baseCommitSHA = newCommitSHA;
        
        if (!gitInfo.remoteTree) gitInfo.remoteTree = [];

        const treeMap = new Map(gitInfo.remoteTree.map(item => [item.path, item]));
        const committedTreeMap = new Map();

        treeItems.forEach(newItem => {
            if (newItem.sha === null) {
                treeMap.delete(newItem.path);
            } else {
                const itemData = { 
                    path: newItem.path, 
                    mode: newItem.mode, 
                    type: newItem.type, 
                    sha: newItem.sha 
                };
                treeMap.set(newItem.path, itemData);
                committedTreeMap.set(newItem.path, itemData); 
            }
        });

        gitInfo.remoteTree = Array.from(treeMap.values());

        if (gitContextItem.type !== 'github') {
            const ikarData = { ...gitInfo, baseCommitSHA: newCommitSHA, remoteTree: gitInfo.remoteTree };
            const ikarContent = `// B"H\n\nconst ikar = ${JSON.stringify(ikarData, null, 4)};`;
            const ikarItem = { ...gitContextItem, path: `${gitContextItem.path}/.awtsmoos-repo/ikar.js` };
            await FileSystemProvider.write(ikarItem, ikarContent);
        } else {
            gitContextItem.baseCommitSHA = newCommitSHA;
            gitContextItem.remoteTree = gitInfo.remoteTree;
        }

        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;
        const itemsToClear = [...processedFiles, ...processedDeletions];
        if (itemsToClear.length > 0) {
            await this._clearUncommittedState(gitContextItem, workspaceId, {
                creations: processedFiles, updates: [], deletions: processedDeletions
            }, committedTreeMap);
        }
    },

    async _executeGitCommit(repoInfo, branch, parentSHA, treeItems, message, force = false) {
        let treePayload = { tree: treeItems };
        if (parentSHA) {
            const parentCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits/${parentSHA}`);
            treePayload.base_tree = parentCommit.tree.sha;
        }
        const newTree = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
            method: 'POST', body: JSON.stringify(treePayload)
        });
        const newCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
            method: 'POST', body: JSON.stringify({ message, tree: newTree.sha, parents: parentSHA ? [parentSHA] : [] })
        });
        
        await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs/heads/${branch}`, {
            method: 'PATCH', 
            body: JSON.stringify({ 
                sha: newCommit.sha,
                force: force 
            })
        });
        return newCommit.sha;
    },

    async _clearUncommittedState(gitContextItem, workspaceId, changeSet, committedTreeMap) {
        const allChanges = [
            ...(changeSet.creations || []),
            ...(changeSet.updates || []),
            ...(changeSet.deletions || [])
        ];

        const promises = allChanges.map(change => {
            const relativePath = change.path;
            const uniquePathForStaging = `${workspaceId}::${relativePath}`;
            const isDirectRepo = gitContextItem.type === 'github';
            let fullPath;
            if (isDirectRepo) {
                fullPath = relativePath;
            } else {
                const cloneRootPath = gitContextItem.path;
                fullPath = cloneRootPath === '/' ? `/${relativePath}` : `${cloneRootPath}/${relativePath}`;
            }
            const fullUniquePathToFind = `${workspaceId}::${fullPath}`;
            const tab = State.tabs.find(t => t.uniquePath === fullUniquePathToFind);
            if (tab) {
                tab.isDirty = false;
                tab.isUncommitted = false;
                if (committedTreeMap && committedTreeMap.has(relativePath)) {
                    const newItemInfo = committedTreeMap.get(relativePath);
                    tab.item.sha = newItemInfo.sha;
                }
            }
            return FileSystemProvider.IndexedDB.deleteUncommitted(uniquePathForStaging);
        });
        await Promise.all(promises);
        Tabs.render();
    }
};