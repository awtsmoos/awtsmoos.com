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
} from './tabs.js'; // B"H - This sacred import is now needed for the discard ritual.

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
                branch: newRepoData.default_branch
            }, changeSet, 'B"H: Initial Commit');

            UI.showLoading("Binding the folder to its celestial soul...");
            const newTree = await FileSystemProvider.GitHub.getFullTree({
                repoInfo,
                branch: newRepoData.default_branch
            });
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





    /*B"H*/

    /**
     * Performs the first commit to a new, empty repository. This is the sacred first breath,
     * creating the root of the history tree and giving the repository form.
     * @private
     * @param {object} params - The necessary info: repoInfo, branch, message, and changeSet.
     * @returns {Promise<string>} - The SHA of the newly created commit.
     */
    async _performInitialCommit({
        repoInfo,
        branch,
        commitMessage,
        changeSet
    }) {
        const blobCreationPromises = changeSet.creations.map(file =>
            FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs`, {
                method: 'POST',
                body: JSON.stringify({
                    content: FileSystemProvider.GitHub.utf8_to_b64(file.content),
                    encoding: 'base64'
                })
            }).then(blob => ({
                path: file.path,
                sha: blob.sha,
                mode: '100644',
                type: 'blob'
            }))
        );
        const treeItems = await Promise.all(blobCreationPromises);

        const newTree = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
            method: 'POST',
            body: JSON.stringify({
                tree: treeItems
            })
        });

        const newCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
            method: 'POST',
            body: JSON.stringify({
                message: commitMessage,
                tree: newTree.sha,
                parents: []
            })
        });

        await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`, {
            method: 'POST',
            body: JSON.stringify({
                ref: `refs/heads/${branch}`,
                sha: newCommit.sha
            })
        });

        return newCommit.sha;
    },

    /**
     * Entry point. Called when the Git Actions button on a folder is clicked.
     */
    // B"H
    async showGitUI(gitContextItem) { // Note: Renamed for clarity, this can be a local clone or a direct workspace
        UI.showLoading("Reading repository data...");

        // For direct GitHub workspaces, the context IS the gitInfo. For local, we fetch it.
        const gitInfo = gitContextItem.type === 'github' ?
            gitContextItem :
            await GitMetaProvider.getGitInfoForFolder(gitContextItem);

        if (!gitInfo) {
            UI.hideLoading();
            UI.showToast("This is not a Git-aware folder.", "error");
            return;
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
            // --- END NEW ---

            const changeSet = await this.calculateDiff(gitContextItem, gitInfo);
            const localChangesCount = (changeSet.creations.length + changeSet.updates.length + changeSet.deletions.length);
            const isAhead = localChangesCount > 0;

            UI.hideLoading();
            // Pass the new remoteChanges object to the dialog
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

    /**
     * Displays the dialog with status and commit options.
     * This version gracefully handles the "No changes" state and adds the "Discard Changes" option.
     */
    // B"H
    async showCommitDialog(gitContextItem, gitInfo, {
        isBehind,
        isAhead,
        localChangesCount,
        changeSet,
        remoteChanges
    }) {
        // --- NEW: More intelligent status messages ---
        let localStatusMessage = isAhead ? `${localChangesCount} change(s) detected` : 'In sync with remote';
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
            title: `Git Actions for ${gitContextItem.name}`,
            contentHTML: statusHTML,
            hasTextarea: isAhead && !isBehind,
            textareaContent: commitMessage,
            okText: okButtonText,
            cancelText: 'Close',
            tertiary: (isAhead && !isBehind) ? {
                text: 'Discard Changes',
                class: 'danger'
            } : null
        });

        /*B"H*/
        // ACTION: This logic block now handles the new 'tertiary' (Discard) option.

        if (dialogResult !== null) {
            if (dialogResult === 'tertiary') {
                // This is our new discard action, a return to the last known divine state.
                await this.discardChanges(gitContextItem);
            } else if (okButtonAction === 'commit') {
                UI.showLoading("Performing atomic commit...");
                try {
                    // Step 1: Delegate the entire complex commit ceremony to our powerful method.
                    const newCommitSHA = await this.performCommit(gitInfo, changeSet, dialogResult);

                    // Step 2: After a successful commit, we must update the local blueprint.
                    UI.showLoading("Updating local repository state...");
                    const {
                        repoInfo,
                        branch
                    } = gitInfo;
                    const newTree = await FileSystemProvider.GitHub.getFullTree({
                        repoInfo,
                        branch
                    });
                    const updatedGitInfo = { ...gitInfo,
                        baseCommitSHA: newCommitSHA,
                        remoteTree: newTree.tree
                    };

                    // Step 3: Inscribe the new reality into our local metadata file if it exists.
                    if (gitContextItem.type !== 'github') { // Only for local clones
                        const ikarFileContent = `// B"H\n\nconst ikar = ${JSON.stringify(updatedGitInfo, null, 4)};`;
                        const ikarFileItem = { ...gitContextItem,
                            path: `${gitContextItem.path}/.awtsmoos-repo/ikar.js`
                        };
                        await FileSystemProvider.write(ikarFileItem, ikarFileContent);
                    }


                    UI.hideLoading();
                    UI.showToast("Changes committed successfully!", "success");
                } catch (e) {
                    UI.hideLoading();
                    UI.showToast(`Commit failed: ${e.message}`, 'error', 8000);
                    console.error("COMMIT FAILED:", e);
                }

            } else if (okButtonAction === 'pull') {
                // This part remains unchanged.
                FileOperations.pullAndOverwrite(gitContextItem, gitInfo);
            }
        }
    },


    /**
     * B"H
     * A new sacred ritual to undo local modifications, returning the workspace to the pristine state
     * of its last commit. This is an act of Teshuvah (repentance), erasing the uncommitted "sins" (changes)
     * and restoring the files to their original, sanctified form as dictated by the remote source.
     * @param {object} gitContextItem - The folder or workspace whose changes are to be discarded.
     * @returns {Promise<void>}
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

            // 1. Find and banish all uncommitted changes from the temporary realm of IndexedDB.
            const uncommittedEntries = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
            const deletionPromises = uncommittedEntries.map(entry =>
                FileSystemProvider.IndexedDB.deleteUncommitted(entry.uniquePath)
            );
            await Promise.all(deletionPromises);

            // 2. Find all open tabs from this workspace that have been tainted by local changes and command them to repent.
            const tabsToRevert = State.tabs.filter(tab => (tab.item.workspaceId === workspaceId) && (tab.isDirty || tab.isUncommitted));
            let activeTabNeedsReload = false;

            for (const tab of tabsToRevert) {
                tab.isDirty = false;
                tab.isUncommitted = false;
                tab.content = null; // Purge the tainted, cached content.
                tab.forceReload = true; // Command it to seek its true form from the source upon its next awakening.
                if (tab.id === State.activeTabId) {
                    activeTabNeedsReload = true;
                }
            }

            // 3. Re-render the tab bar to reflect their newly purified state.
            Tabs.render();

            // 4. If the user was gazing upon one of the reverted files, force it to re-awaken immediately.
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
    // ACTION: Add this single, unified 'performCommit' method to your 'GitManager' object.

    /**
     * Performs the true, atomic, multi-file commit. This is the unified and definitive
     * version. It intelligently detects whether it's creating a root commit (no prior
     * history) or an ongoing commit, and performs the correct API calls for either case.
     * This single function now holds the wisdom for all forms of commitment.
     * @param {object} gitContext - An object with { repoInfo, branch }.
     * @param {object} changeSet - The object of creations, updates, and deletions.
     * @param {string} commitMessage - The user's commit message.
     * @returns {Promise<string>} The SHA of the new commit.
     */
    async performCommit({
        repoInfo,
        branch
    }, changeSet, commitMessage) {
        const latestCommitSHA = await FileSystemProvider.GitHub.getLatestCommitSHA({
            repoInfo,
            branch
        });

        const allFileChanges = [...(changeSet.creations || []), ...(changeSet.updates || [])];
        const blobCreationPromises = allFileChanges.map(file =>
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
        );
        const treeItems = await Promise.all(blobCreationPromises);

        (changeSet.deletions || []).forEach(file => {
            treeItems.push({
                path: file.path,
                mode: '100644',
                type: 'blob',
                sha: null
            });
        });

        let newCommit;
        if (latestCommitSHA) {
            // --- Path of Ongoing History ---
            const latestCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits/${latestCommitSHA}`);
            const newTree = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
                method: 'POST',
                body: JSON.stringify({
                    base_tree: latestCommit.tree.sha,
                    tree: treeItems
                })
            });
            newCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
                method: 'POST',
                body: JSON.stringify({
                    message: commitMessage,
                    tree: newTree.sha,
                    parents: [latestCommitSHA]
                })
            });
            await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs/heads/${branch}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    sha: newCommit.sha
                })
            });
        } else {
            // --- Path of the First Word (Root Commit) ---
            const newTree = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
                method: 'POST',
                body: JSON.stringify({
                    tree: treeItems
                })
            });
            newCommit = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
                method: 'POST',
                body: JSON.stringify({
                    message: commitMessage,
                    tree: newTree.sha,
                    parents: []
                })
            });
            await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`, {
                method: 'POST',
                body: JSON.stringify({
                    ref: `refs/heads/${branch}`,
                    sha: newCommit.sha
                })
            });
        }

        return newCommit.sha;
    },



    /**
     * The new, intelligent diff function that compares content SHAs. This function now
     * correctly handles both direct GitHub workspaces and local clones.
     */
    async calculateDiff(gitContextItem, gitInfo) {
        const changeSet = {
            creations: [],
            updates: [],
            deletions: []
        };
        const remoteFileMap = new Map(gitInfo.remoteTree.map(f => [f.path, f]));
        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;

        // Get all uncommitted changes, which represent the current local state for this context
        const uncommittedChanges = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
        const uncommittedMap = new Map(uncommittedChanges.map(c => [c.item.path, c]));

        // Process creations and updates from the uncommitted changes
        for (const change of uncommittedChanges) {
            const {
                path
            } = change.item;
            const remoteFile = remoteFileMap.get(path);
            if (!remoteFile) {
                changeSet.creations.push({
                    path,
                    content: change.content
                });
            } else {
                // For direct GitHub workspaces, any uncommitted change is an update.
                // For local clones, we would ideally re-calculate SHA, but for simplicity
                // and consistency, we'll trust the uncommitted store.
                changeSet.updates.push({
                    path,
                    content: change.content
                });
            }
        }


        // For local clones, we still need to check for deletions and unchanged files.
        if (gitContextItem.type !== 'github') {
            const localFiles = await FileSystemProvider.listAllFiles(gitContextItem);
            const basePath = gitContextItem.path;

            for (const localFile of localFiles) {
                const relativePath = localFile.path.startsWith(basePath + '/') ?
                    localFile.path.substring(basePath.length + 1) :
                    localFile.path;

                if (relativePath.startsWith('.awtsmoos-repo')) continue;

                // If it's already in our update/create list, skip it.
                if (uncommittedMap.has(relativePath)) continue;

                const remoteFile = remoteFileMap.get(relativePath);
                if (remoteFile) {
                    const rawContent = await FileSystemProvider.read({ ...gitContextItem,
                        path: localFile.path
                    });
                    const stringContent = (rawContent instanceof Blob) ? await rawContent.text() : (rawContent || '');
                    const localSha = await calculateGitBlobSha(stringContent);

                    if (localSha !== remoteFile.sha) {
                        changeSet.updates.push({
                            path: relativePath,
                            content: stringContent
                        });
                    }
                } else {
                    // This file exists locally but not remotely and wasn't in uncommitted.
                    // This can happen if a save fails or state is weird. Add it as a creation.
                    const rawContent = await FileSystemProvider.read({ ...gitContextItem,
                        path: localFile.path
                    });
                    const stringContent = (rawContent instanceof Blob) ? await rawContent.text() : (rawContent || '');
                    changeSet.creations.push({
                        path: relativePath,
                        content: stringContent
                    });
                }
            }


            for (const remoteFilePath of remoteFileMap.keys()) {
                const fullLocalPath = `${basePath}/${remoteFilePath}`;
                if (!localFiles.some(f => f.path === fullLocalPath)) {
                    changeSet.deletions.push({
                        path: remoteFilePath
                    });
                }
            }
        }


        return changeSet;
    }
};
