// B"H
// FILE: js/git-manager.js

import {
    State,
    DOM
} from './state.js';
import {
    UI
} from './ui.js';
import {
    FileSystemProvider
} from './fs-provider.js';
import {
    Workspaces,
    getItemUniquePath
} from './workspaces.js';
import {
    GitMetaProvider
} from './git-meta-provider.js';
import {
    App
} from './app.js';
import {
    FileOperations
} from './file-operations.js';
import {
    calculateGitBlobSha
} from './git-sha-calculator.js';
import {
    Tabs
} from './tabs.js';

export const GitManager = {

    /*B"H*/

    /**
     * Guides the user through creating a new GitHub repository from an existing local folder.
     */
    async initializeRepository(folderItem) {
        if (!State.githubToken) {
            const token = await UI.showDialog({
                title: "GitHub Token Required",
                message: "Enter a GitHub Personal Access Token with 'repo' scope to create a repository.",
                hasInput: true,
                inputType: 'password',
                placeholder: "ghp_...",
                okText: "Continue"
            });
            if (token) {
                State.githubToken = token;
                App.saveSettings();
            } else return;
        }

        const detailsHTML = `<p>Create a new repository on GitHub from the contents of <strong>'${folderItem.name}'</strong>.</p><label for="repo-name">New Repository Name</label><input type="text" id="repo-name" value="${folderItem.name.replace(/[^a-zA-Z0-9-.]/g, '-').toLowerCase()}"><label for="repo-desc">Description (optional)</label><textarea id="repo-desc"></textarea><div style="display: flex; align-items: center; gap: 10px; margin-top: 15px;"><input type="checkbox" id="repo-private" style="width: auto;"><label for="repo-private">Private repository</label></div>`;
        const result = await UI.showDialog({
            title: 'Initialize GitHub Repository',
            contentHTML: detailsHTML,
            okText: 'Create & Push'
        });
        if (!result) return;

        const repoName = document.getElementById('repo-name').value;
        const description = document.getElementById('repo-desc').value;
        const isPrivate = document.getElementById('repo-private').checked;
        if (!repoName) {
            UI.showToast("Repository name is required.", "error");
            return;
        }

        try {
            UI.showLoading(`Creating repository '${repoName}' on GitHub...`);
            const newRepoData = await FileSystemProvider.GitHub.api('/user/repos', {
                method: 'POST',
                body: JSON.stringify({
                    name: repoName,
                    description,
                    private: isPrivate,
                    auto_init: false
                })
            });

            UI.showLoading("Gathering local files for initial commit...");
            const allFiles = await FileSystemProvider.listAllFiles(folderItem);
            const changeSet = {
                creations: []
            };

            if (allFiles.length === 0) {
                changeSet.creations.push({
                    path: '.gitkeep',
                    content: ''
                });
            } else {
                const basePath = folderItem.path === '/' ? '' : folderItem.path;
                for (const file of allFiles) {
                    const relativePath = file.path.startsWith(basePath + '/') ? file.path.substring(basePath.length + 1) : file.path;
                    if (relativePath && !relativePath.startsWith('.awtsmoos-repo')) {
                        const rawContent = await FileSystemProvider.read({ ...folderItem,
                            path: file.path
                        });
                        const stringContent = (rawContent instanceof Blob) ? await rawContent.text() : (rawContent || '');
                        changeSet.creations.push({
                            path: relativePath,
                            content: stringContent
                        });
                    }
                }
            }

            if (changeSet.creations.length === 0) {
                changeSet.creations.push({
                    path: '.gitkeep',
                    content: ''
                });
            }

            UI.showLoading("Performing the first, sacred commit...");
            const repoInfo = {
                owner: newRepoData.owner.login,
                repo: newRepoData.name
            };
            /*B"H*/

            const initialCommitSHA = await this.performCommit({ // Now calls the public, unified method
                repoInfo,
                branch: newRepoData.default_branch,
                type: 'github', // Mark as direct github for context
                id: folderItem.id || State.nextWorkspaceId // Fallback ID
            }, { 
                repoInfo, 
                branch: newRepoData.default_branch,
                remoteTree: [] // Initialize empty tree
            }, changeSet, 'B"H: Initial Commit');

            UI.showLoading("Binding the folder to its celestial soul...");
            const newTree = await FileSystemProvider.GitHub.getFullTree({
                repoInfo,
                branch: newRepoData.default_branch
            });
            
            // Only write metadata if it's a local folder becoming a clone
            if(folderItem.type !== 'github') {
                const gitInfo = {
                    isClone: true,
                    repoInfo,
                    branch: newRepoData.default_branch,
                    baseCommitSHA: initialCommitSHA,
                    remoteTree: newTree.tree
                };

                const ikarFileContent = `// B"H\n\nconst ikar = ${JSON.stringify(gitInfo, null, 4)};`;
                await FileSystemProvider.create(folderItem, '.awtsmoos-repo', 'directory');
                const metaDirItem = { ...folderItem,
                    path: `${folderItem.path}/.awtsmoos-repo`
                };
                const ikarFileItem = { ...metaDirItem,
                    name: 'ikar.js',
                    path: `${metaDirItem.path}/ikar.js`
                };
                await FileSystemProvider.write(ikarFileItem, ikarFileContent);
                
                const parentOfItem = { ...folderItem,
                    path: folderItem.path.substring(0, folderItem.path.lastIndexOf('/')) || '/'
                };
                await Workspaces.refreshNode(parentOfItem);
            }

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

    /**
     * B"H
     * This function is the enlightened eye of the Git system.
     */
    async showGitUI(gitContextItem) {
        UI.showLoading("Reading repository data...");

        let gitInfo = gitContextItem.type === 'github' ?
            gitContextItem :
            await GitMetaProvider.getGitInfoForFolder(gitContextItem);

        if (!gitInfo) {
            UI.hideLoading();
            UI.showToast("This is not a Git-aware folder.", "error");
            return;
        }

        UI.showLoading("Analyzing repository status...");
        try {
            let isBehind = false;
            let remoteChanges = null;

            if (gitContextItem.type === 'github') {
                // For Direct GitHub, we fetch the latest tree to know the absolute truth.
                const treeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
                gitInfo = { ...gitInfo,
                    remoteTree: treeData.tree,
                    baseCommitSHA: treeData.sha
                };
                isBehind = false; 
            } else {
                // For Clones, we check if our memory (baseCommitSHA) matches the remote reality.
                const remoteCommitSHA = await FileSystemProvider.GitHub.getLatestCommitSHA(gitInfo);
                isBehind = remoteCommitSHA !== gitInfo.baseCommitSHA;

                if (isBehind) {
                    UI.showLoading("Fetching remote changes...");
                    const newTreeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
                    const newRemoteTree = newTreeData.tree;
                    const oldRemoteTree = gitInfo.remoteTree;

                    const newFiles = new Map(newRemoteTree.map(f => [f.path, f]));
                    const oldFiles = new Map(oldRemoteTree.map(f => [f.path, f]));

                    remoteChanges = {
                        additions: [],
                        modifications: [],
                        deletions: []
                    };

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
            }

            const changeSet = await this.calculateDiff(gitContextItem, gitInfo);
            const localChangesCount = (changeSet.creations.length + changeSet.updates.length + changeSet.deletions.length);
            const isAhead = localChangesCount > 0;

            UI.hideLoading();
            this.showCommitDialog(gitContextItem, gitInfo, {
                isBehind,
                isAhead,
                localChangesCount,
                changeSet,
                remoteChanges
            });

        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Error checking Git status: ${e.message}`, 'error');
            console.error(e);
        }
    },

    /*B"H*/
    async showCommitDialog(gitContextItem, gitInfo, {
        isBehind,
        changeSet,
        remoteChanges
    }) {
        const dirtyFiles = changeSet.dirtyFiles || [];
        const inscribedChanges = [...changeSet.creations, ...changeSet.updates, ...changeSet.deletions];
        const hasDirty = dirtyFiles.length > 0;
        const hasInscribed = inscribedChanges.length > 0;
        const isAhead = hasDirty || hasInscribed;
        const localChangesCount = new Set([...dirtyFiles.map(f => f.relativePath), ...inscribedChanges.map(f => f.path)]).size;

        let localStatusMessage = isAhead ? `${localChangesCount} change(s) detected` : 'In sync with remote';
        if (isBehind) localStatusMessage = "Out of date with remote";

        let statusHTML = `<div class="git-status-line">${localStatusMessage}</div>`;
        if (isAhead) {
            statusHTML += `<div class="changes-list"><strong>Local Changes:</strong><ul>`;
            dirtyFiles.forEach(f => statusHTML += `<li><span class="tag modified dirty">UNSAVED</span> ${f.relativePath}</li>`);
            changeSet.creations.forEach(f => statusHTML += `<li><span class="tag created">ADDED</span> ${f.path}</li>`);
            changeSet.updates.forEach(f => statusHTML += `<li><span class="tag modified">MODIFIED</span> ${f.path}</li>`);
            changeSet.deletions.forEach(f => statusHTML += `<li><span class="tag deleted">DELETED</span> ${f.path}</li>`);
            statusHTML += `</ul></div>`;
        }

        const dialogConfig = {
            title: `Git Actions for ${gitContextItem.name}`,
            contentHTML: statusHTML,
            hasTextarea: isAhead && !isBehind,
            textareaContent: `B"H\nUpdated at ${new Date().toLocaleString()}`,
            cancelText: 'Close',
            tertiary: (isAhead && !isBehind) ? { text: 'Discard Changes', class: 'danger' } : null
        };
        if (isBehind) dialogConfig.okText = 'Pull & Overwrite Local Changes';
        else if (hasDirty && !hasInscribed) dialogConfig.okText = 'Save and Commit All';
        else if (hasDirty && hasInscribed) {
            dialogConfig.okText = 'Save and Commit All';
            dialogConfig.secondaryOk = { text: 'Commit Inscribed Only', actionKey: 'commit_inscribed' };
        } else if (!hasDirty && hasInscribed) dialogConfig.okText = 'Commit All';

        const dialogResult = await UI.showDialog(dialogConfig);
        if (dialogResult === null) return;

        const handleCommit = async (finalChangeSet, commitMessage) => {
            UI.showLoading("Committing to GitHub...");
            
            // 1. Perform the commit
            const newCommitSHA = await this.performCommit(gitContextItem, gitInfo, finalChangeSet, commitMessage);
            
            // 2. Fetch the authoritative tree from GitHub to ensure absolute sync
            UI.showLoading("Verifying final repository state...");
            const newTree = await FileSystemProvider.GitHub.getFullTree(gitInfo);
            
            // 3. Update the persistent metadata (ikar.js) or memory state
            if (gitContextItem.type !== 'github') {
                const updatedGitInfo = { ...gitInfo, baseCommitSHA: newCommitSHA, remoteTree: newTree.tree };
                const ikarFileContent = `// B"H\n\nconst ikar = ${JSON.stringify(updatedGitInfo, null, 4)};`;
                const ikarFileItem = { ...gitContextItem, path: `${gitContextItem.path}/.awtsmoos-repo/ikar.js` };
                await FileSystemProvider.write(ikarFileItem, ikarFileContent);
            } else {
                gitContextItem.remoteTree = newTree.tree;
                gitContextItem.baseCommitSHA = newTree.sha;
            }
            
            UI.showToast("Changes committed successfully!", "success");
        };

        try {
            if (dialogResult === 'tertiary') await this.discardChanges(gitContextItem);
            else if (isBehind) FileOperations.pullAndOverwrite(gitContextItem, gitInfo);
            else if (isAhead) {
                const commitMessage = document.getElementById('dialog-textarea')?.value || `B"H\nUpdate`;
                if (dialogResult === 'commit_inscribed') {
                    await handleCommit(changeSet, commitMessage);
                } else { 
                    if (hasDirty) {
                        UI.showLoading("Saving all changes...");
                        const savePromises = dirtyFiles.map(df => {
                            const tab = State.tabs.find(t => t.item === df.tabItem);
                            return tab ? Tabs.save(tab) : Promise.resolve();
                        });
                        await Promise.all(savePromises);
                    }
                    UI.showLoading("Recalculating final changes...");
                    const finalChangeSet = await this.calculateDiff(gitContextItem, gitInfo);
                    await handleCommit(finalChangeSet, commitMessage);
                }
            }
        } catch (e) {
           
            let finalMessage = `COMMIT FAILED: ${e.message}`;
            if (e.message && (e.message.includes("Bad credentials") || e.message.includes("token"))) {
                finalMessage += "\nPlease check your GitHub token in Settings.";
            }
            UI.showToast(finalMessage, 'error', 8000);
            console.error("COMMIT FAILED:", e);
           
        } finally {
            UI.hideLoading();
        }
    },

    /*B"H*/
    /**
     * Clears the uncommitted state for files that have been processed.
     * UPDATED FIX: This function now actively updates the SHA of open tabs
     * using the map of committed items. This fixes the bug where reloading
     * a page after a commit would revert to the old version because the 
     * tab session still held the old SHA.
     */
    async _clearUncommittedState(gitContextItem, workspaceId, changeSet, committedTreeMap) {
        const allChanges = [
            ...(changeSet.creations || []),
            ...(changeSet.updates || []),
            ...(changeSet.deletions || [])
        ];

        const promises = allChanges.map(change => {
            const relativePath = change.path;
            const uniquePathForStaging = `${workspaceId}::${relativePath}`;

            // Resolve the full path for the tab
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
                
                // B"H - CRITICAL FIX: Update the Tab's SHA
                // We check if this file exists in the map of newly committed items (treeItems).
                // If it does, we update the tab's item to point to the NEW SHA.
                if (committedTreeMap && committedTreeMap.has(relativePath)) {
                    const newItemInfo = committedTreeMap.get(relativePath);
                    // Update the tab's item. This ensures that next time saveSession/loadSession runs,
                    // it persists the correct, new SHA.
                    tab.item.sha = newItemInfo.sha;
                }
            }
            
            return FileSystemProvider.IndexedDB.deleteUncommitted(uniquePathForStaging);
        });

        await Promise.all(promises);
        Tabs.render();
    },

    /**
     * Discards local changes.
     */
    async discardChanges(gitContextItem) {
        const confirmed = await UI.showDialog({
            title: 'Confirm Discard',
            message: `Are you sure you want to discard all local, uncommitted changes in '${gitContextItem.name}'? This cannot be undone.`,
            okText: 'Yes, Discard All',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        UI.showLoading("Reverting local changes...");
        try {
            const workspaceId = gitContextItem.workspaceId || gitContextItem.id;

            const uncommittedEntries = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
            const deletionPromises = uncommittedEntries.map(entry =>
                FileSystemProvider.IndexedDB.deleteUncommitted(entry.uniquePath)
            );
            await Promise.all(deletionPromises);

            const tabsToRevert = State.tabs.filter(tab => (tab.item.workspaceId === workspaceId) && (tab.isDirty || tab.isUncommitted));
            let activeTabNeedsReload = false;

            for (const tab of tabsToRevert) {
                tab.isDirty = false;
                tab.isUncommitted = false;
                tab.content = null; 
                tab.forceReload = true; 
                if (tab.id === State.activeTabId) {
                    activeTabNeedsReload = true;
                }
            }

            Tabs.render();

            if (activeTabNeedsReload) {
                await Tabs.activate(State.activeTabId);
            }

            UI.showToast("Local changes have been discarded.", 'success');
        } catch (e) {
            UI.showToast(`Error discarding changes: ${e.message}`, 'error');
            console.error("DISCARD FAILED:", e);
        } finally {
            UI.hideLoading();
        }
    },

    /*B"H*/
    /**
     * Performs a robust, segmented commit strategy to avoid API size limits.
     */
    async performCommit(gitContextItem, gitInfo, changeSet, commitMessage) {
        const { repoInfo, branch } = gitInfo;
        
        if (!gitInfo.remoteTree) gitInfo.remoteTree = [];

        const filesToUpload = [...(changeSet.creations || []), ...(changeSet.updates || [])];
        const filesToDelete = changeSet.deletions || [];
        
        const FILES_PER_COMMIT = 25; 
        const BLOB_BATCH_SIZE = 5;   
        const COOL_DOWN_MS = 2000;   

        let currentParentSHA = await FileSystemProvider.GitHub.getLatestCommitSHA({ repoInfo, branch });
        let commitCount = 1;
        const totalCommits = Math.ceil(filesToUpload.length / FILES_PER_COMMIT) + (filesToDelete.length > 0 ? 1 : 0);

        // --- 1. Processing Uploads ---
        while (filesToUpload.length > 0) {
            const currentBatchFiles = filesToUpload.splice(0, FILES_PER_COMMIT);
            
            UI.showLoading(`Processing Commit ${commitCount}/${totalCommits}: Uploading ${currentBatchFiles.length} files...`);

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
                await new Promise(r => setTimeout(r, 500)); 
            }

            const messagePart = totalCommits > 1 ? ` (Part ${commitCount}/${totalCommits})` : '';
            const newCommitSHA = await this._executeGitCommit(
                repoInfo, branch, currentParentSHA, treeItems, commitMessage + messagePart
            );

            await this._saveIncrementalState(gitContextItem, gitInfo, newCommitSHA, currentBatchFiles, [], treeItems);

            currentParentSHA = newCommitSHA;
            commitCount++;

            if (filesToUpload.length > 0) {
                UI.showLoading(`Cooling down API (waiting ${COOL_DOWN_MS/1000}s)...`);
                await new Promise(resolve => setTimeout(resolve, COOL_DOWN_MS));
            }
        }

        // --- 2. Process Deletions ---
        if (filesToDelete.length > 0) {
            UI.showLoading(`Processing Commit ${commitCount}/${totalCommits}: Deleting ${filesToDelete.length} files...`);
            const treeItems = filesToDelete.map(file => ({
                path: file.path, mode: '100644', type: 'blob', sha: null
            }));

            const newCommitSHA = await this._executeGitCommit(
                repoInfo, branch, currentParentSHA, treeItems, commitMessage + " (Deletions)"
            );

            await this._saveIncrementalState(gitContextItem, gitInfo, newCommitSHA, [], filesToDelete, treeItems);
            currentParentSHA = newCommitSHA;
        }

        return currentParentSHA;
    },

    /**
     * Helper: Updates ikar.js, clears IndexedDB, AND UPDATES THE FILE LIST.
     */
    async _saveIncrementalState(gitContextItem, gitInfo, newCommitSHA, processedFiles = [], processedDeletions = [], treeItems = []) {
        // 1. Update the SHA
        gitInfo.baseCommitSHA = newCommitSHA;
        
        if (!gitInfo.remoteTree) gitInfo.remoteTree = [];

        // Map needed to find existing entries quickly
        const treeMap = new Map(gitInfo.remoteTree.map(item => [item.path, item]));

        // Create a map of the NEW items (committed in this batch) for Tab updating
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
                committedTreeMap.set(newItem.path, itemData); // Add to our lookup map
            }
        });

        // Save the updated list back to the gitInfo object
        gitInfo.remoteTree = Array.from(treeMap.values());

        // 3. Write ikar.js to disk
        if (gitContextItem.type !== 'github') {
            const ikarData = { ...gitInfo, baseCommitSHA: newCommitSHA, remoteTree: gitInfo.remoteTree };
            const ikarContent = `// B"H\n\nconst ikar = ${JSON.stringify(ikarData, null, 4)};`;
            const ikarItem = { ...gitContextItem, path: `${gitContextItem.path}/.awtsmoos-repo/ikar.js` };
            await FileSystemProvider.write(ikarItem, ikarContent);
        } else {
            gitContextItem.baseCommitSHA = newCommitSHA;
            gitContextItem.remoteTree = gitInfo.remoteTree;
        }

        // 4. Clear Green Dots (Uncommitted status) AND UPDATE TAB SHAS
        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;
        const itemsToClear = [...processedFiles, ...processedDeletions];
        if (itemsToClear.length > 0) {
            // We pass the committedTreeMap so we can find the new SHAs
            await this._clearUncommittedState(gitContextItem, workspaceId, {
                creations: processedFiles, updates: [], deletions: processedDeletions
            }, committedTreeMap);
        }
    },

    async _executeGitCommit(repoInfo, branch, parentSHA, treeItems, message) {
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
            method: 'PATCH', body: JSON.stringify({ sha: newCommit.sha })
        });
        return newCommit.sha;
    },

    /*B"H*/
    async calculateDiff(gitContextItem, gitInfo) {
        const changeSet = {
            creations: [],
            updates: [],
            deletions: [],
            dirtyFiles: []
        };

        const remoteFileMap = new Map(
            (gitInfo.remoteTree || [])
            .filter(f => f.type === 'blob') 
            .map(f => [f.path, f])
        );
        
        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;

        const getRelativePath = (fullPath) => {
            if (gitContextItem.type === 'github') return fullPath; 
            const cloneRoot = gitContextItem.path;
            if (cloneRoot === '/') return fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;
            if (fullPath.startsWith(cloneRoot + '/')) return fullPath.substring(cloneRoot.length + 1);
            return null;
        };

        State.tabs.forEach(tab => {
            if (!tab.isDirty || tab.item.workspaceId !== workspaceId) return;
            const relPath = getRelativePath(tab.item.path);
            if (relPath) {
                changeSet.dirtyFiles.push({ tabItem: tab.item, relativePath: relPath });
            }
        });

        const uncommittedChanges = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
        const handledPaths = new Set(); 
        
        for (const change of uncommittedChanges) {
            const relativePath = change.item.path; 
            handledPaths.add(relativePath);
            
            if (!remoteFileMap.has(relativePath)) {
                changeSet.creations.push({ path: relativePath, content: change.content });
            } else {
                changeSet.updates.push({ path: relativePath, content: change.content });
            }
        }

        if (gitContextItem.type !== 'github') {
            const localFiles = await FileSystemProvider.listAllFiles(gitContextItem);
            const localFilePaths = new Set(); 

            for (const file of localFiles) {
                const relPath = getRelativePath(file.path);
                if (!relPath) continue;

                localFilePaths.add(relPath);

                if (handledPaths.has(relPath)) continue;

                if (!remoteFileMap.has(relPath)) {
                    try {
                        const rawContent = await FileSystemProvider.read({ ...gitContextItem, path: file.path });
                        let stringContent = '';
                        if (rawContent instanceof Blob) {
                            stringContent = await rawContent.text();
                        } else if (typeof rawContent === 'string') {
                            stringContent = rawContent;
                        } else if (rawContent && rawContent.base64Content) {
                             stringContent = atob(rawContent.base64Content);
                        }
                        
                        changeSet.creations.push({ path: relPath, content: stringContent });
                    } catch (readErr) {
                    }
                }
            }

            const deletionCandidates = [];
            for (const remoteFilePath of remoteFileMap.keys()) {
                if (!localFilePaths.has(remoteFilePath)) {
                    deletionCandidates.push(remoteFilePath);
                }
            }

            for (const candidatePath of deletionCandidates) {
                try {
                    const absPath = gitContextItem.path === '/' ? `/${candidatePath}` : `${gitContextItem.path}/${candidatePath}`;
                    await FileSystemProvider.read({ ...gitContextItem, path: absPath, kind: 'file' });
                } catch (e) {
                    changeSet.deletions.push({ path: candidatePath });
                }
            }
        }

        return changeSet;
    }
};