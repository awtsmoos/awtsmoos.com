
// B"H
// FILE: js/git-manager.js

import { State } from './state.js';
import { UI } from './ui.js';
import { FileSystemProvider } from './fs-provider.js';
import { Workspaces } from './workspaces.js';
import { GitMetaProvider } from './git-meta-provider.js';
import { App } from './app.js';
import { FileOperations } from './file-operations.js';
import { Tabs } from './tabs.js';

// B"H - NEW IMPORTS
import { GitCommit } from './git/git-commit.js';
import { GitDiff } from './git/git-diff.js';

export const GitManager = {

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

            if (changeSet.creations.length === 0) changeSet.creations.push({ path: '.gitkeep', content: '' });

            UI.showLoading("Performing the first, sacred commit...");
            const repoInfo = { owner: newRepoData.owner.login, repo: newRepoData.name };

            const initialCommitSHA = await GitCommit.performCommit({ 
                repoInfo,
                branch: newRepoData.default_branch,
                type: 'github', 
                id: folderItem.id || State.nextWorkspaceId 
            }, { 
                repoInfo, 
                branch: newRepoData.default_branch,
                remoteTree: [] 
            }, changeSet, 'B"H: Initial Commit');

            UI.showLoading("Binding the folder to its celestial soul...");
            const newTree = await FileSystemProvider.GitHub.getFullTree({ repoInfo, branch: newRepoData.default_branch });
            
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
                const metaDirItem = { ...folderItem, path: `${folderItem.path}/.awtsmoos-repo` };
                const ikarFileItem = { ...metaDirItem, name: 'ikar.js', path: `${metaDirItem.path}/ikar.js` };
                await FileSystemProvider.write(ikarFileItem, ikarFileContent);
                
                const parentOfItem = { ...folderItem, path: folderItem.path.substring(0, folderItem.path.lastIndexOf('/')) || '/' };
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

    async showGitUI(gitContextItem, performScan = false) {
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
                // For GitHub workspaces, performScan implies re-fetching the tree from remote
                // to detect if external changes happened (sync check).
                if (performScan || !gitInfo._treeCache) {
                    const treeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
                    gitInfo = { ...gitInfo, remoteTree: treeData.tree, baseCommitSHA: treeData.sha };
                    // Update workspace cache
                    const ws = State.workspaces.find(w => w.id === gitContextItem.id);
                    if (ws) {
                        ws.remoteTree = treeData.tree;
                        ws.baseCommitSHA = treeData.sha;
                    }
                }
                // GitHub workspaces are never "Behind" in the local sense, 
                // but we can check if the in-memory tree is stale compared to latest SHA.
                // For now, we assume performScan updates state.
                isBehind = false; 
            } else {
                const remoteCommitSHA = await FileSystemProvider.GitHub.getLatestCommitSHA(gitInfo);
                isBehind = remoteCommitSHA !== gitInfo.baseCommitSHA;

                if (isBehind) {
                    UI.showLoading("Fetching remote changes...");
                    const newTreeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
                    const newRemoteTree = newTreeData.tree;
                    const oldRemoteTree = gitInfo.remoteTree;

                    const newFiles = new Map(newRemoteTree.map(f => [f.path, f]));
                    const oldFiles = new Map(oldRemoteTree.map(f => [f.path, f]));

                    remoteChanges = { additions: [], modifications: [], deletions: [] };

                    newFiles.forEach((file, path) => {
                        if (!oldFiles.has(path)) remoteChanges.additions.push(path);
                        else if (oldFiles.get(path).sha !== file.sha) remoteChanges.modifications.push(path);
                    });
                    oldFiles.forEach((file, path) => {
                        if (!newFiles.has(path)) remoteChanges.deletions.push(path);
                    });
                }
            }

            // B"H - Performance Check: Only scan untracked files if explicitly requested
            if (performScan) {
                UI.showLoading("Scanning file system...");
            }
            const changeSet = await GitDiff.calculateDiff(gitContextItem, gitInfo, { checkUntracked: performScan });
            const localChangesCount = (changeSet.creations.length + changeSet.updates.length + changeSet.deletions.length);
            const isAhead = localChangesCount > 0;

            UI.hideLoading();
            this.showCommitDialog(gitContextItem, gitInfo, {
                isBehind, isAhead, localChangesCount, changeSet, remoteChanges, performScan
            });

        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Error checking Git status: ${e.message}`, 'error');
            console.error(e);
        }
    },

    async showCommitDialog(gitContextItem, gitInfo, { isBehind, isAhead, localChangesCount, changeSet, remoteChanges, performScan }) {
        const dirtyFiles = changeSet.dirtyFiles || [];
        const conflicts = changeSet.conflicts || [];
        const inscribedChanges = [...changeSet.creations, ...changeSet.updates, ...changeSet.deletions];
        const hasDirty = dirtyFiles.length > 0;
        const hasInscribed = inscribedChanges.length > 0;
        const hasConflicts = conflicts.length > 0;
        
        let localStatusMessage = isAhead ? `${localChangesCount} change(s) detected` : 'In sync with remote';
        if (isBehind) localStatusMessage = "Out of date with remote";
        if (hasConflicts) localStatusMessage = `<span style="color:var(--color-accent-danger)">⚠️ CONFLICTS DETECTED</span>`;
        if (!performScan && gitContextItem.type !== 'github') localStatusMessage += " <span style='font-size:0.8em; color:var(--color-text-tertiary)'> (Quick Scan)</span>";

        let statusHTML = `<div class="git-status-line">${localStatusMessage}</div>`;
        
        // B"H - INCOMING REMOTE CHANGES
        if (remoteChanges) {
             const count = remoteChanges.additions.length + remoteChanges.modifications.length + remoteChanges.deletions.length;
             if (count > 0) {
                 statusHTML += `<div class="changes-list" style="border-color: var(--color-accent-info);">
                    <strong>Incoming Remote Changes:</strong><ul>`;
                 remoteChanges.additions.forEach(p => statusHTML += `<li><span class="tag created">NEW</span> ${p}</li>`);
                 remoteChanges.modifications.forEach(p => statusHTML += `<li><span class="tag modified">MOD</span> ${p}</li>`);
                 remoteChanges.deletions.forEach(p => statusHTML += `<li><span class="tag deleted">DEL</span> ${p}</li>`);
                 statusHTML += `</ul></div>`;
             }
        }

        // B"H - CONFLICTS
        if (hasConflicts) {
            statusHTML += `<div class="changes-list" style="border-color: var(--color-accent-danger);">
                <strong>Conflicts (Remote differs from your base):</strong><ul>`;
            conflicts.forEach(c => statusHTML += `<li title="${c.reason}"><span class="tag deleted">CONFLICT</span> ${c.path}</li>`);
            statusHTML += `</ul></div>`;
        }

        // B"H - LOCAL CHANGES
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
            hasTextarea: isAhead && !isBehind && !hasConflicts,
            textareaContent: `B"H\nUpdated at ${new Date().toLocaleString()}`,
            cancelText: 'Close',
            tertiary: (isAhead && !isBehind) ? { text: 'Discard Changes', class: 'danger' } : null
        };

        // B"H - Option to Scan Changes manually
        // We show this for GitHub too now, to allow refreshing state
        if (!performScan) {
            dialogConfig.secondaryOk = { text: 'Scan for Changes', actionKey: 'full_scan' };
        } else if (hasDirty && hasInscribed && !hasConflicts) {
            dialogConfig.secondaryOk = { text: 'Commit Inscribed Only', actionKey: 'commit_inscribed' };
        }

        if (hasConflicts) {
            // B"H - UPDATED CONFLICT RESOLUTION
            dialogConfig.message = "Unsaved/Local changes conflict with the remote state. Choose strategy:";
            dialogConfig.okText = 'Pull & Overwrite Local';
            dialogConfig.secondaryOk = { text: 'Push (Force Overwrite)', actionKey: 'force_push' };
        } else if (isBehind) {
            dialogConfig.okText = 'Pull & Overwrite Local Changes';
            dialogConfig.secondaryOk = { text: 'Push (Force Overwrite)', actionKey: 'force_push' };
        } else if (hasDirty && !hasInscribed) {
            dialogConfig.okText = 'Save and Commit All';
        } else if (hasDirty && hasInscribed) {
            dialogConfig.okText = 'Save and Commit All';
        } else if (!hasDirty && hasInscribed) {
            dialogConfig.okText = 'Commit All';
        }

        const dialogResult = await UI.showDialog(dialogConfig);
        if (dialogResult === null) return;

        // B"H - Handle Full Scan Request
        if (dialogResult === 'full_scan') {
            await this.showGitUI(gitContextItem, true);
            return;
        }

        // B"H - Handle Force Push
        if (dialogResult === 'force_push') {
            const confirmPush = await UI.showDialog({
                title: "DANGER: Force Push",
                message: "This will OVERWRITE the remote repository history with your local state. This action is destructive and cannot be undone.",
                okText: "Yes, Force Push",
                cancelText: "Cancel",
                tertiary: null
            });
            if (!confirmPush) return;
        }

        const handleCommit = async (finalChangeSet, commitMessage, force = false) => {
            UI.showLoading(force ? "Force Pushing to GitHub..." : "Committing to GitHub...");
            
            const newCommitSHA = await GitCommit.performCommit(
                gitContextItem, 
                gitInfo, 
                finalChangeSet, 
                commitMessage, 
                { force } // Pass force option
            );
            
            UI.showLoading("Verifying final repository state...");
            const newTree = await FileSystemProvider.GitHub.getFullTree(gitInfo);
            
            if (gitContextItem.type !== 'github') {
                const updatedGitInfo = { ...gitInfo, baseCommitSHA: newCommitSHA, remoteTree: newTree.tree };
                const ikarFileContent = `// B"H\n\nconst ikar = ${JSON.stringify(updatedGitInfo, null, 4)};`;
                const ikarFileItem = { ...gitContextItem, path: `${gitContextItem.path}/.awtsmoos-repo/ikar.js` };
                await FileSystemProvider.write(ikarFileItem, ikarFileContent);
            } else {
                gitContextItem.remoteTree = newTree.tree;
                gitContextItem.baseCommitSHA = newTree.sha;
                // B"H - Refresh the Workspace UI to show new tree state if needed (e.g. creations)
                await Workspaces.refreshNode(gitContextItem);
            }
            
            UI.showToast(force ? "Force Push Successful!" : "Changes committed successfully!", "success");
        };

        try {
            if (dialogResult === 'tertiary') await this.discardChanges(gitContextItem);
            else if (dialogResult === 'force_pull') FileOperations.pullAndOverwrite(gitContextItem, gitInfo);
            // B"H - If conflicts/behind and result is not force_push, it means they clicked 'Pull & Overwrite' (okText)
            else if ((isBehind || hasConflicts) && dialogResult !== 'force_push') FileOperations.pullAndOverwrite(gitContextItem, gitInfo);
            else if ((isAhead && !hasConflicts) || dialogResult === 'force_push') {
                
                const commitMessage = document.getElementById('dialog-textarea')?.value || `B"H\nUpdate`;
                const isForce = dialogResult === 'force_push';

                if (dialogResult === 'commit_inscribed' || isForce) {
                    await handleCommit(changeSet, commitMessage, isForce);
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
                    // Recalculate diff to ensure saved changes are picked up as updates
                    // Must pass checkUntracked to ensure we capture untracked files if we were in full scan mode
                    const finalChangeSet = await GitDiff.calculateDiff(gitContextItem, gitInfo, { checkUntracked: performScan });
                    await handleCommit(finalChangeSet, commitMessage, isForce);
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

    // B"H - NEW METHOD: Switch Branches
    async switchBranch(item) {
        // 1. Get Repo Info & Current Branch
        let repoInfo, currentBranch;
        
        if (item.type === 'github') {
            repoInfo = item.repoInfo;
            currentBranch = item.branch;
        } else {
            // Clone
            const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
            if (!gitInfo) {
                UI.showToast("Not a git repository.", "error");
                return;
            }
            repoInfo = gitInfo.repoInfo;
            currentBranch = gitInfo.branch;
        }

        UI.showLoading("Fetching branches...");
        try {
            // 2. Fetch Branches
            const branchesData = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/branches`);
            const branches = branchesData.map(b => b.name);
            
            // 3. Show Branch Selection Dialog
            const branchListHTML = branches.map(b => {
                const isActive = b === currentBranch;
                return `
                    <button class="menu-button ${isActive ? 'active-branch' : ''}" data-branch="${b}" style="${isActive ? 'border-color: var(--neon-lime); color: var(--neon-lime);' : ''}">
                        <svg class="svg-icon"><use href="#icon-git-branch"></use></svg>
                        <span>${b}</span> ${isActive ? '(Current)' : ''}
                    </button>
                `;
            }).join('');

            const contentHTML = `
                <div style="max-height: 250px; overflow-y: auto; display:flex; flex-direction:column; gap:5px; margin-bottom: 10px;">
                    ${branchListHTML}
                </div>
                <div style="border-top: 1px solid var(--color-border); padding-top: 10px;">
                    <label>Create New Branch:</label>
                    <div style="display:flex; gap:5px;">
                        <input type="text" id="new-branch-name" placeholder="new-branch-name">
                        <button id="create-branch-btn" class="primary-btn">Create</button>
                    </div>
                </div>
            `;

            const dialog = document.getElementById('generic-dialog');
            // We use a custom flow, so we don't await showDialog directly for value
            UI.showDialog({
                title: `Switch Branch (${repoInfo.repo})`,
                contentHTML,
                okText: "", // Hide default OK
                cancelText: "Close"
            });

            // Attach Listeners
            const container = dialog.querySelector('.dialog-content');
            
            // Handle Clicking existing branch
            const branchBtns = container.querySelectorAll('button[data-branch]');
            branchBtns.forEach(btn => {
                btn.onclick = () => {
                    const branchName = btn.dataset.branch;
                    if (branchName === currentBranch) return;
                    this._performSwitch(item, repoInfo, branchName);
                    dialog.querySelector('#dialog-cancel-btn').click(); // Close dialog
                };
            });

            // Handle Creating new branch
            container.querySelector('#create-branch-btn').onclick = async () => {
                const newName = container.querySelector('#new-branch-name').value.trim();
                if(!newName) return;
                
                try {
                    UI.showLoading("Creating branch...");
                    // 1. Get SHA of current branch (or main)
                    const refData = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/ref/heads/${currentBranch}`);
                    const sha = refData.object.sha;
                    
                    // 2. Create Ref
                    await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`, {
                        method: 'POST',
                        body: JSON.stringify({
                            ref: `refs/heads/${newName}`,
                            sha: sha
                        })
                    });
                    
                    UI.showToast(`Branch '${newName}' created!`, "success");
                    this._performSwitch(item, repoInfo, newName);
                    dialog.querySelector('#dialog-cancel-btn').click();
                    
                } catch(e) {
                    console.error(e);
                    UI.showToast("Failed to create branch: " + e.message, "error");
                    UI.hideLoading(); // Only hide if failed, performSwitch shows it again
                }
            };

        } catch(e) {
            UI.showToast("Failed to fetch branches: " + e.message, "error");
            UI.hideLoading();
        }
    },

    async _performSwitch(item, repoInfo, newBranch) {
        UI.showLoading(`Switching to '${newBranch}'...`);
        
        try {
            if (item.type === 'github') {
                // Direct GitHub Workspace: Easy, just update state and refresh
                item.branch = newBranch;
                item._treeCache = null; // Clear cache
                await Workspaces.refreshNode(item);
                UI.showToast(`Switched to branch '${newBranch}'`, "success");
            } else {
                // Local Clone: Needs logic
                const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
                if (!gitInfo) throw new Error("Metadata missing.");
                
                // 1. Update ikar.js
                gitInfo.branch = newBranch;
                // We reset baseCommitSHA so pull logic knows we shifted context, 
                // but strictly speaking, we need the SHA of the NEW branch.
                // pullAndOverwrite fetches the tree of the target branch, so it will update baseCommitSHA.
                
                // 2. Write updated ikar.js
                const ikarContent = `// B"H\n\nconst ikar = ${JSON.stringify(gitInfo, null, 4)};`;
                const ikarItem = { ...item, path: `${item.path}/.awtsmoos-repo/ikar.js` };
                await FileSystemProvider.write(ikarItem, ikarContent);
                
                // 3. Prompt for Pull
                const pullNow = await UI.showDialog({
                    title: "Branch Switched (Metadata)",
                    message: `Local metadata updated to '${newBranch}'.\nDo you want to download the files from this branch now? (This will overwrite local files)`,
                    okText: "Download & Overwrite",
                    cancelText: "Later (Manual Pull)"
                });
                
                if (pullNow) {
                    await FileOperations.pullAndOverwrite(item, gitInfo);
                } else {
                    UI.showToast(`Switched to '${newBranch}'. Don't forget to Pull!`, "info");
                }
            }
        } catch(e) {
            console.error(e);
            UI.showToast("Switch failed: " + e.message, "error");
        } finally {
            UI.hideLoading();
        }
    }
};
