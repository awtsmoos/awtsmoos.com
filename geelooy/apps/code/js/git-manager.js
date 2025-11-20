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
// patience, awaiting all save operations before proceeding, and correctly passes
// context for state updates.

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

    let statusHTML = `<div class="git-status-line">...</div>`; // Keep existing status HTML generation...
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
        // THE FIX: Pass the necessary context to clear the state correctly.
        await this._clearUncommittedState(gitContextItem, gitContextItem.workspaceId || gitContextItem.id, finalChangeSet);
        UI.showToast("Changes committed successfully!", "success");
    };

    try {
        if (dialogResult === 'tertiary') await this.discardChanges(gitContextItem);
        else if (isBehind) FileOperations.pullAndOverwrite(gitContextItem, gitInfo);
        else if (isAhead) {
            const commitMessage = document.getElementById('dialog-textarea')?.value || `B"H\nUpdate`;
            if (dialogResult === 'commit_inscribed') {
                await handleCommit(changeSet, commitMessage);
            } else { // This handles both 'Save and Commit All' and the default 'Commit All'
                if (hasDirty) {
                    UI.showLoading("Saving all changes...");
                    // THE FIX FOR THE RACE CONDITION: Await all save promises.
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
        UI.showToast(`Commit failed: ${e.message}`, 'error', 8000);
        console.error("COMMIT FAILED:", e);
    } finally {
        UI.hideLoading();
    }
},


/*B"H*/
// ACTION: Replace the _clearUncommittedState method. This version is taught empathy for
// context, correctly translating relative paths back to absolute paths to find
// and update tab states, ensuring the green dot of sanctification is properly removed.

async _clearUncommittedState(gitContextItem, workspaceId, changeSet) {
    const allChanges = [
        ...(changeSet.creations || []),
        ...(changeSet.updates || []),
        ...(changeSet.deletions || [])
    ];

    const promises = allChanges.map(change => {
        const relativePath = change.path;
        const uniquePathForStaging = `${workspaceId}::${relativePath}`;

        // Find the corresponding tab by translating the path back to the tab's reality.
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
        }
        
        // Return the promise to delete the record from the ledger.
        return FileSystemProvider.IndexedDB.deleteUncommitted(uniquePathForStaging);
    });

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
// ACTION: Replace the calculateDiff method. This version refines the data structure
// for dirty files and improves the path relativity logic for deletions,
// setting the stage for the fixes that follow.

async calculateDiff(gitContextItem, gitInfo) {
    const changeSet = {
        creations: [],
        updates: [],
        deletions: [],
        dirtyFiles: [] // Holds { tabItem: object, relativePath: string }
    };
    const remoteFileMap = new Map((gitInfo.remoteTree || []).map(f => [f.path, f]));
    const workspaceId = gitContextItem.workspaceId || gitContextItem.id;

    State.tabs.forEach(tab => {
        if (!tab.isDirty || tab.item.workspaceId !== workspaceId) return;
        const isDirectRepo = gitContextItem.type === 'github';
        let relativePath;
        if (isDirectRepo) {
            relativePath = tab.item.path;
        } else {
            const cloneRootPath = gitContextItem.path;
            const fileFullPath = tab.item.path;
            if (cloneRootPath === '/' && fileFullPath.startsWith('/')) {
                relativePath = fileFullPath.substring(1);
            } else if (fileFullPath && fileFullPath.startsWith(cloneRootPath + '/')) {
                relativePath = fileFullPath.substring(cloneRootPath.length + 1);
            }
        }
        if (typeof relativePath === 'string') {
            changeSet.dirtyFiles.push({ tabItem: tab.item, relativePath: relativePath });
        }
    });

    const uncommittedChanges = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
    for (const change of uncommittedChanges) {
        const { path } = change.item;
        if (!remoteFileMap.has(path)) {
            changeSet.creations.push({ path, content: change.content });
        } else {
            changeSet.updates.push({ path, content: change.content });
        }
    }

    if (gitContextItem.type !== 'github') {
        const localFiles = await FileSystemProvider.listAllFiles(gitContextItem);
        const localFilePaths = new Set(localFiles.map(f => {
            let relPath = f.path;
            if (gitContextItem.path === '/') {
                relPath = f.path.startsWith('/') ? f.path.substring(1) : f.path;
            } else if (f.path.startsWith(gitContextItem.path + '/')) {
                relPath = f.path.substring(gitContextItem.path.length + 1);
            }
            return relPath;
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
