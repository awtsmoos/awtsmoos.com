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
 * B"H
  * This function is the enlightened eye of the Git system, now capable of two modes of perception.
 */
async showGitUI(gitContextItem) {
    UI.showLoading("Reading repository data...");

    // First, we must determine the source of our knowledge: is it inscribed locally in ikar.js,
    // or is it the living, breathing state of the GitHub workspace itself?
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

        // The Two Paths of Perception:
        if (gitContextItem.type === 'github') {
            // PATH 1: The Direct Gaze. A direct workspace cannot be "behind." Its present IS the remote truth.
            // We fetch its current state to form a baseline for comparison against uncommitted changes.
            const treeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
            // We temporarily bestow the fetched knowledge upon our gitInfo object, giving it substance.
            gitInfo = { ...gitInfo,
                remoteTree: treeData.tree,
                baseCommitSHA: treeData.sha
            };
            isBehind = false; // By definition, it cannot be behind.
        } else {
            // PATH 2: The Reflected Image. A local clone has a memory of the past (`baseCommitSHA`).
            // We must check if this memory is outdated.
            const remoteCommitSHA = await FileSystemProvider.GitHub.getLatestCommitSHA(gitInfo);
            isBehind = remoteCommitSHA !== gitInfo.baseCommitSHA;

            if (isBehind) {
                UI.showLoading("Fetching remote changes...");
                const newTreeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
                const newRemoteTree = newTreeData.tree;
                // This is now safe, as only local clones (which have .remoteTree) can enter this block.
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

        // Now, because gitInfo is guaranteed to have a .remoteTree, this call is safe from the abyss.
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
/**
 * Displays the Git dialog, now a chamber of counsel. It perceives the difference
 * between Ephemeral (unsaved) and Inscribed (saved) changes and manifests the
 * precise buttons needed for the user's intent, offering single or multiple paths
 * to sanctification (commitment) as the situation demands.
 * @param {object} gitContextItem - The folder or workspace being operated on.
 * @param {object} gitInfo - The git metadata for the context item.
 * @param {object} status - The calculated status, including the new `dirtyFiles` list.
 */
async showCommitDialog(gitContextItem, gitInfo, {
    isBehind,
    isAhead,
    changeSet,
    remoteChanges
}) {
    // Determine the nature of local changes.
    const dirtyFiles = changeSet.dirtyFiles || [];
    const inscribedChanges = [...changeSet.creations, ...changeSet.updates, ...changeSet.deletions];
    const hasDirty = dirtyFiles.length > 0;
    const hasInscribed = inscribedChanges.length > 0;

    let localChangesCount = new Set([
        ...dirtyFiles.map(f => f.path),
        ...inscribedChanges.map(f => f.path)
    ]).size;
    
    isAhead = localChangesCount > 0; // Recalculate isAhead based on all potential changes.

    // --- Build the Status UI ---
    let localStatusMessage = isAhead ? `${localChangesCount} change(s) detected` : 'In sync with remote';
    if (isBehind) localStatusMessage = "Out of date with remote";

    let statusHTML = `<div class="git-status-line">...</div>`; // Keep existing status HTML generation...
     if (isAhead) {
        statusHTML += `<div class="changes-list"><strong>Local Changes:</strong><ul>`;
        // Display dirty files distinctly.
        dirtyFiles.forEach(f => statusHTML += `<li><span class="tag modified dirty">UNSAVED</span> ${f.path}</li>`);
        changeSet.creations.forEach(f => statusHTML += `<li><span class="tag created">ADDED</span> ${f.path}</li>`);
        changeSet.updates.forEach(f => statusHTML += `<li><span class="tag modified">MODIFIED</span> ${f.path}</li>`);
        changeSet.deletions.forEach(f => statusHTML += `<li><span class="tag deleted">DELETED</span> ${f.path}</li>`);
        statusHTML += `</ul></div>`;
    }


    // --- CONFIGURE THE DIALOG BASED ON THE NATURE OF CHANGES ---
    const dialogConfig = {
        title: `Git Actions for ${gitContextItem.name}`,
        contentHTML: statusHTML,
        hasTextarea: isAhead && !isBehind,
        textareaContent: `B"H\nUpdated at ${new Date().toLocaleString()}`,
        cancelText: 'Close',
        tertiary: (isAhead && !isBehind) ? { text: 'Discard Changes', class: 'danger' } : null
    };

    if (isBehind) {
        dialogConfig.okText = 'Pull & Overwrite Local Changes';
    } else if (hasDirty && !hasInscribed) {
        dialogConfig.okText = 'Save and Commit All';
    } else if (hasDirty && hasInscribed) {
        dialogConfig.okText = 'Save and Commit All';
        dialogConfig.secondaryOk = { text: 'Commit Inscribed Only', actionKey: 'commit_inscribed' };
    } else if (!hasDirty && hasInscribed) {
        dialogConfig.okText = 'Commit All';
    }

    const dialogResult = await UI.showDialog(dialogConfig);
    if (dialogResult === null) return; // User cancelled.

    // --- HANDLE THE USER'S CHOSEN PATH ---
    
    // The handler for the final act of sanctification.
    const handleCommit = async (finalChangeSet, commitMessage) => {
        UI.showLoading("Committing to GitHub...");
        const newCommitSHA = await this.performCommit(gitInfo, finalChangeSet, commitMessage);
        
        UI.showLoading("Updating repository state...");
        const newTree = await FileSystemProvider.GitHub.getFullTree(gitInfo);
        const updatedGitInfo = { ...gitInfo, baseCommitSHA: newCommitSHA, remoteTree: newTree.tree };
        
        if (gitContextItem.type !== 'github') {
            const ikarFileContent = `// B"H\n\nconst ikar = ${JSON.stringify(updatedGitInfo, null, 4)};`;
            const ikarFileItem = { ...gitContextItem, path: `${gitContextItem.path}/.awtsmoos-repo/ikar.js` };
            await FileSystemProvider.write(ikarFileItem, ikarFileContent);
        } else {
            gitContextItem.remoteTree = newTree.tree;
            gitContextItem.baseCommitSHA = newTree.sha;
        }

        await this._clearUncommittedState(gitContextItem.workspaceId || gitContextItem.id, finalChangeSet);
        UI.showToast("Changes committed successfully!", "success");
    };

    try {
        if (dialogResult === 'tertiary') {
            await this.discardChanges(gitContextItem);
        } else if (isBehind) {
            FileOperations.pullAndOverwrite(gitContextItem, gitInfo);
        } else if (isAhead) {
            const commitMessage = dialogResult === true ? document.getElementById('dialog-textarea').value : dialogResult;
            
            if (dialogResult === 'commit_inscribed') {
                // Path 1: Sanctify only the Inscribed.
                await handleCommit(changeSet, commitMessage);
            } else {
                // Path 2: Sanctify the Ephemeral and the Inscribed together.
                if (hasDirty) {
                    UI.showLoading("Saving all changes...");
                    for (const file of dirtyFiles) {
                        const tab = State.tabs.find(t => t.uniquePath === getItemUniquePath(file));
                        if (tab) await Tabs.save(tab);
                    }
                }
                UI.showLoading("Recalculating final changes...");
                const finalChangeSet = await this.calculateDiff(gitContextItem, gitInfo);
                await handleCommit(finalChangeSet, commitMessage);
            }
        }
    } catch (e) {
        UI.showToast(`Commit failed: ${e.message}`, 'error', 8000);
        console.error("COMMIT FAILED:", e);
    } finally {
        UI.hideLoading();
    }
},


/**
 * Clears the temporary "uncommitted" state for files after a successful commit.
 * This involves deleting the records from IndexedDB and resetting the state of any
 * corresponding open tabs to remove the "dirty" and "uncommitted" indicators.
 * @private
 * @param {number} workspaceId - The ID of the workspace to clean.
 * @param {object} changeSet - The set of changes that were just committed.
 * @returns {Promise<void>}
 */
async _clearUncommittedState(workspaceId, changeSet) {
    const allChanges = [
        ...(changeSet.creations || []),
        ...(changeSet.updates || []),
        ...(changeSet.deletions || [])
    ];

    const promises = [];

    for (const change of allChanges) {
        const uniquePath = `${workspaceId}::${change.path}`;
        promises.push(FileSystemProvider.IndexedDB.deleteUncommitted(uniquePath));

        const tab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (tab) {
            tab.isDirty = false;
            tab.isUncommitted = false;
        }
    }

    await Promise.all(promises);
    Tabs.render();
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



    /*B"H*/
/**
 * The new, enlightened diff function. It not only compares the Inscribed state
 * (saved files) against the Sanctified (remote), but it now also perceives the
 * Ephemeral state by identifying any unsaved (`isDirty`) tabs that belong to
 * the repository, returning them as a distinct category of change.
 * @param {object} gitContextItem - The folder or workspace being operated on.
 * @param {object} gitInfo - The git metadata for the context item.
 * @returns {Promise<object>} A change set object containing creations, updates, deletions, and now, dirtyFiles.
 */
async calculateDiff(gitContextItem, gitInfo) {
    const changeSet = {
        creations: [],
        updates: [],
deletions: [],
        dirtyFiles: [] // The new perception of the Ephemeral.
    };
    const remoteFileMap = new Map((gitInfo.remoteTree || []).map(f => [f.path, f]));
    const workspaceId = gitContextItem.workspaceId || gitContextItem.id;

    // --- PERCEIVE THE EPHEMERAL ---
    // Find all unsaved tabs within this Git context.
    State.tabs.forEach(tab => {
        if (tab.isDirty && (tab.item.workspaceId === workspaceId)) {
            // Ensure the tab's item path is relative to the git root for clones.
            let relativePath = tab.item.path;
            if (gitContextItem.path !== '/') {
                 relativePath = tab.item.path.startsWith(gitContextItem.path + '/') 
                    ? tab.item.path.substring(gitContextItem.path.length + 1)
                    : null;
            }
            if (relativePath) {
                changeSet.dirtyFiles.push({ ...tab.item, path: relativePath });
            }
        }
    });

    // --- PERCEIVE THE INSCRIBED (UNCHANGED FROM BEFORE) ---
    const uncommittedChanges = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
    for (const change of uncommittedChanges) {
        const { path } = change.item;
        if (!remoteFileMap.has(path)) {
            changeSet.creations.push({ path, content: change.content });
        } else {
            changeSet.updates.push({ path, content: change.content });
        }
    }

    // For local clones, we must also check for deletions.
    if (gitContextItem.type !== 'github') {
        const localFiles = await FileSystemProvider.listAllFiles(gitContextItem);
        const localFilePaths = new Set(localFiles.map(f => {
            const relativePath = f.path.startsWith(gitContextItem.path + '/') 
                ? f.path.substring(gitContextItem.path.length + 1) 
                : f.path;
            return relativePath;
        }));

        for (const remoteFilePath of remoteFileMap.keys()) {
            if (!localFilePaths.has(remoteFilePath)) {
                changeSet.deletions.push({ path: remoteFilePath });
            }
        }
    }

    return changeSet;
},
};
