// B"H
// FILE: js/git-manager.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { FileSystemProvider } from './fs-provider.js';
import { Workspaces, getItemUniquePath } from './workspaces.js';
import { GitMetaProvider } from './git-meta-provider.js';
import { App } from './app.js';
import { FileOperations } from './file-operations.js';
import { calculateGitBlobSha } from './git-sha-calculator.js';

export const GitManager = {



/*B"H*/

/**
 * Guides the user through creating a new GitHub repository from an existing local folder.
 * This is the definitive, corrected version. It transforms the folder in-place,
 * handles API errors with specific messages, and ensures the initial commit is
 * always made, thus sanctifying the new repository with a history from its first breath.
 * @param {object} folderItem - The local directory to be transformed into a repository.
 */
async initializeRepository(folderItem) {
    if (!State.githubToken) {
        const token = await UI.showDialog({ title: "GitHub Token Required", message: "Enter a GitHub Personal Access Token with 'repo' scope to create a repository.", hasInput: true, inputType: 'password', placeholder: "ghp_...", okText: "Continue" });
        if (token) { State.githubToken = token; App.saveSettings(); } else return;
    }

    const detailsHTML = `<p>Create a new repository on GitHub from the contents of <strong>'${folderItem.name}'</strong>.</p><label for="repo-name">New Repository Name</label><input type="text" id="repo-name" value="${folderItem.name.replace(/[^a-zA-Z0-9-.]/g, '-').toLowerCase()}"><label for="repo-desc">Description (optional)</label><textarea id="repo-desc"></textarea><div style="display: flex; align-items: center; gap: 10px; margin-top: 15px;"><input type="checkbox" id="repo-private" style="width: auto;"><label for="repo-private">Private repository</label></div>`;
    const result = await UI.showDialog({ title: 'Initialize GitHub Repository', contentHTML: detailsHTML, okText: 'Create & Push' });
    if (!result) return;

    const repoName = document.getElementById('repo-name').value;
    const description = document.getElementById('repo-desc').value;
    const isPrivate = document.getElementById('repo-private').checked;
    if (!repoName) { UI.showToast("Repository name is required.", "error"); return; }

    try {
        UI.showLoading(`Creating repository '${repoName}' on GitHub...`);
        const newRepoData = await FileSystemProvider.GitHub.api('/user/repos', {
            method: 'POST',
            body: JSON.stringify({ name: repoName, description, private: isPrivate, auto_init: false })
        });

        UI.showLoading("Gathering local files for initial commit...");
        const allFiles = await FileSystemProvider.listAllFiles(folderItem);
        const changeSet = { creations: [] };

        if (allFiles.length === 0) {
            changeSet.creations.push({ path: '.gitkeep', content: '' });
        } else {
            const basePath = folderItem.path === '/' ? '' : folderItem.path;
            for (const file of allFiles) {
                 const relativePath = file.path.startsWith(basePath + '/') ? file.path.substring(basePath.length + 1) : file.path;
                 if (relativePath && !relativePath.startsWith('.awtsmoos-repo')) {
                     const rawContent = await FileSystemProvider.read({ ...folderItem, path: file.path });
                     const stringContent = (rawContent instanceof Blob) ? await rawContent.text() : (rawContent || '');
                     changeSet.creations.push({ path: relativePath, content: stringContent });
                 }
            }
        }
        
        if (changeSet.creations.length === 0) {
            changeSet.creations.push({ path: '.gitkeep', content: '' });
        }

        UI.showLoading("Performing the first, sacred commit...");
        const repoInfo = { owner: newRepoData.owner.login, repo: newRepoData.name };
        const initialCommitSHA = await this._performInitialCommit({
            repoInfo, branch: newRepoData.default_branch,
            commitMessage: 'B"H: Initial Commit', changeSet
        });

        UI.showLoading("Binding the folder to its celestial soul...");
        const newTree = await FileSystemProvider.GitHub.getFullTree({ repoInfo, branch: newRepoData.default_branch });
        const gitInfo = {
            isClone: true, repoInfo, branch: newRepoData.default_branch,
            baseCommitSHA: initialCommitSHA, remoteTree: newTree.tree
        };

        const ikarFileContent = `// B"H\n\nconst ikar = ${JSON.stringify(gitInfo, null, 4)};`;
        await FileSystemProvider.create(folderItem, '.awtsmoos-repo', 'directory');
        const metaDirItem = { ...folderItem, path: `${folderItem.path}/.awtsmoos-repo` };
        const ikarFileItem = { ...metaDirItem, name: 'ikar.js', path: `${metaDirItem.path}/ikar.js` };
        await FileSystemProvider.write(ikarFileItem, ikarFileContent);

        const parentOfItem = { ...folderItem, path: folderItem.path.substring(0, folderItem.path.lastIndexOf('/')) || '/' };
        await Workspaces.refreshNode(parentOfItem);

        UI.hideLoading();
        UI.showToast(`'${repoName}' created and linked successfully!`, "success");

    } catch (e) {
        UI.hideLoading();
        let errorMessage = e.message;
        if (e.message && e.message.toLowerCase().includes("name already exists")) {
            errorMessage = "A repository with this name already exists on your account.";
        }
        UI.showToast(`Initialization failed: ${errorMessage}`, 'error', 8000);
        console.error("GIT INIT FAILED:", e);
    }
},

/*B"H*/

/**
 * Performs the first commit to a new, empty repository. This is the sacred first breath,
 * creating the root of the history tree and giving the repository form.
 * @private
 * @param {object} params - The necessary info: repoInfo, branch, message, and changeSet.
 * @returns {Promise<string>} - The SHA of the newly created commit.
 */
async _performInitialCommit({ repoInfo, branch, commitMessage, changeSet }) {
    const blobCreationPromises = changeSet.creations.map(file =>
        FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs`, {
            method: 'POST', body: JSON.stringify({ content: FileSystemProvider.GitHub.utf8_to_b64(file.content), encoding: 'base64' })
        }).then(blob => ({ path: file.path, sha: blob.sha, mode: '100644', type: 'blob' }))
    );
    const treeItems = await Promise.all(blobCreationPromises);

    const newTree = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
        method: 'POST', body: JSON.stringify({ tree: treeItems })
    });
    
    const newCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
        method: 'POST', body: JSON.stringify({ message: commitMessage, tree: newTree.sha, parents: [] })
    });

    await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: newCommit.sha })
    });

    return newCommit.sha;
},

    /**
     * Entry point. Called when the Git Actions button on a folder is clicked.
     */
    // B"H
    async showGitUI(clonedFolderItem) {
        UI.showLoading("Reading repository data...");
        const gitInfo = await GitMetaProvider.getGitInfoForFolder(clonedFolderItem);

        if (!gitInfo) {
            UI.hideLoading(); UI.showToast("This is not a cloned repository folder.", "error"); return;
        }

        UI.showLoading("Analyzing repository status...");
        try {
            const remoteCommitSHA = await FileSystemProvider.GitHub.getLatestCommitSHA(gitInfo);
            const isBehind = remoteCommitSHA !== gitInfo.baseCommitSHA;
            
            // --- NEW: Calculate Remote Changes if Behind ---
            let remoteChanges = null;
            if (isBehind) {
                UI.showLoading("Fetching remote changes...");
                const newTreeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
                const newRemoteTree = newTreeData.tree;
                const oldRemoteTree = gitInfo.remoteTree;

                const newFiles = new Map(newRemoteTree.map(f => [f.path, f]));
                const oldFiles = new Map(oldRemoteTree.map(f => [f.path, f]));
                
                remoteChanges = { additions: [], modifications: [], deletions: [] };

                newFiles.forEach((file, path) => {
                    if (!oldFiles.has(path)) {
                        remoteChanges.additions.push(path);
                    } else if (oldFiles.get(path).sha !== file.sha) {
                        remoteChanges.modifications.push(path);
                    }
                });
                oldFiles.forEach((file, path) => {
                    if (!newFiles.has(path)) {
                        remoteChanges.deletions.push(path);
                    }
                });
            }
            // --- END NEW ---

            const changeSet = await this.calculateDiff(clonedFolderItem, gitInfo);
            const localChangesCount = (changeSet.creations.length + changeSet.updates.length + changeSet.deletions.length);
            const isAhead = localChangesCount > 0;

            UI.hideLoading();
            // Pass the new remoteChanges object to the dialog
            this.showCommitDialog(clonedFolderItem, gitInfo, { isBehind, isAhead, localChangesCount, changeSet, remoteChanges });

        } catch (e) {
            UI.hideLoading(); UI.showToast(`Error checking Git status: ${e.message}`, 'error'); console.error(e);
        }
    },

    /**
     * Displays the dialog with status and commit options.
     * This version gracefully handles the "No changes" state.
     */
    // B"H
    async showCommitDialog(clonedFolderItem, gitInfo, { isBehind, isAhead, localChangesCount, changeSet, remoteChanges }) {
        // --- NEW: More intelligent status messages ---
        let localStatusMessage = isAhead ? `${localChangesCount} change(s) detected` : 'In sync with local copy';
        if (isBehind) {
            localStatusMessage = "Out of date with remote";
        }
        // --- END NEW ---

        let statusHTML = `
            <div class="git-status-line">
                <span>Remote Status:</span>
                <span class="status ${isBehind ? 'behind' : 'synced'}">${isBehind ? `Behind. Please pull.` : 'In Sync'}</span>
            </div>
            <div class="git-status-line">
                <span>Local Status:</span>
                <span class="status ${isAhead ? 'ahead' : isBehind ? 'behind' : 'synced'}">${localStatusMessage}</span>
            </div>
        `;
        
        
        if (isBehind && remoteChanges) {
            const hasRemoteChanges = remoteChanges.additions.length > 0 || remoteChanges.modifications.length > 0 || remoteChanges.deletions.length > 0;
            if (hasRemoteChanges) {
                statusHTML += `<div class="changes-list"><strong>Remote Changes to Pull:</strong><ul>`;
                remoteChanges.additions.forEach(path => statusHTML += `<li><span class="tag created">ADDED</span> ${path}</li>`);
                remoteChanges.modifications.forEach(path => statusHTML += `<li><span class="tag modified">MODIFIED</span> ${path}</li>`);
                remoteChanges.deletions.forEach(path => statusHTML += `<li><span class="tag deleted">DELETED</span> ${path}</li>`);
                statusHTML += `</ul></div>`;
            }
        }
        // --- END NEW ---

        if (isAhead) {
            statusHTML += `<div class="changes-list"><strong>Local Changes to Push:</strong><ul>`;
            changeSet.creations.forEach(f => statusHTML += `<li><span class="tag created">ADDED</span> ${f.path}</li>`);
            changeSet.updates.forEach(f => statusHTML += `<li><span class="tag modified">MODIFIED</span> ${f.path}</li>`);
            changeSet.deletions.forEach(f => statusHTML += `<li><span class="tag deleted">DELETED</span> ${f.path}</li>`);
            statusHTML += `</ul></div>`;
        }

        const commitMessage = `B"H\nBoruch Hashem!\nBiezras Hashem\nBlessed is He\nAt ${new Date()}`;
        
        let okButtonText = '';
        let okButtonAction = null;
        if (isBehind) {
            okButtonText = 'Pull & Overwrite Local Changes';
            okButtonAction = 'pull';
        } else if (isAhead) {
            okButtonText = 'Commit & Push Changes';
            okButtonAction = 'commit';
        }

        const dialogResult = await UI.showDialog({
            title: `Git Actions for ${clonedFolderItem.name}`,
            contentHTML: statusHTML,
            hasTextarea: isAhead && !isBehind,
            textareaContent: commitMessage,
            okText: okButtonText,
            cancelText: 'Close'
        });

        if (dialogResult !== null) {
            if (okButtonAction === 'commit') {
                await this.performCommit(clonedFolderItem, gitInfo, dialogResult, changeSet);
            } else if (okButtonAction === 'pull') {
                FileOperations.pullAndOverwrite(clonedFolderItem, gitInfo);
            }
        }
    },

    /**
     * Performs the multi-file commit and updates the local metadata.
     */
    async performCommit(clonedFolderItem, gitInfo, commitMessage, changeSet) {
        UI.showLoading("Committing & Pushing...");
        try {
            const newCommitSHA = await FileSystemProvider.GitHub.commitMultipleFiles({
                repoInfo: gitInfo.repoInfo,
                branch: gitInfo.branch,
                commitMessage,
                changeSet
            });

            UI.showLoading("Updating local repository state...");
            const newTree = await FileSystemProvider.GitHub.getFullTree(gitInfo);
            
            const updatedGitInfo = {
                ...gitInfo,
                baseCommitSHA: newCommitSHA,
                remoteTree: newTree.tree
            };

            const ikarFileContent = `// B"H\n\nconst ikar = ${JSON.stringify(updatedGitInfo, null, 4)};`;
            const metaDirItem = { ...clonedFolderItem, path: `${clonedFolderItem.path}/.awtsmoos-repo` };
            const ikarFileItem = { ...metaDirItem, name: 'ikar.js', path: `${metaDirItem.path}/ikar.js` };
            await FileSystemProvider.write(ikarFileItem, ikarFileContent);

            UI.hideLoading();
            UI.showToast("Changes committed successfully!", "success");
        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Commit failed: ${e.message}`, 'error');
            console.error(e);
        }
    },

    /**
     * The new, intelligent diff function that compares content SHAs.
     */
    async calculateDiff(clonedFolderItem, gitInfo) {
        const localFiles = await FileSystemProvider.listAllFiles(clonedFolderItem);
        const remoteTree = gitInfo.remoteTree;
        const remoteFileMap = new Map(remoteTree.map(f => [f.path, f]));
        const changeSet = { creations: [], updates: [], deletions: [] };
        const basePath = clonedFolderItem.path;

        for (const localFile of localFiles) {
            const relativePath = localFile.path.startsWith(basePath + '/') 
                ? localFile.path.substring(basePath.length + 1) 
                : localFile.path;
            
            if (relativePath.startsWith('.awtsmoos-repo')) continue;

            const fullFileItem = { ...clonedFolderItem, path: localFile.path };
            const rawContent = await FileSystemProvider.read(fullFileItem);
            const stringContent = (rawContent instanceof Blob) ? await rawContent.text() : (rawContent || '');
            
            const remoteFile = remoteFileMap.get(relativePath);

            if (!remoteFile) {
                changeSet.creations.push({ path: relativePath, content: stringContent });
            } else {
                const localSha = await calculateGitBlobSha(stringContent);
                if (localSha !== remoteFile.sha) {
                    changeSet.updates.push({ path: relativePath, content: stringContent });
                }
            }
        }
        
        for (const remoteFilePath of remoteFileMap.keys()) {
            const fullLocalPath = `${basePath}/${remoteFilePath}`;
            if (!localFiles.some(f => f.path === fullLocalPath)) {
                changeSet.deletions.push({ path: remoteFilePath });
            }
        }

        return changeSet;
    }
};