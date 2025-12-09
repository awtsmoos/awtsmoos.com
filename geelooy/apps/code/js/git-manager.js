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

    async showGitUI(gitContextItem, fullScan = false) {
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
                // For GitHub workspace, we always need the tree for conflict checking, but API is fast enough usually.
                // If performance issues arise, we can cache this too.
                const treeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
                gitInfo = { ...gitInfo, remoteTree: treeData.tree, baseCommitSHA: treeData.sha };
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

            // B"H - Pass fullScan option
            if (fullScan) {
                UI.showLoading("Scanning all local files (this may take a moment)...");
            }
            const changeSet = await GitDiff.calculateDiff(gitContextItem, gitInfo, { fullScan });
            const localChangesCount = (changeSet.creations.length + changeSet.updates.length + changeSet.deletions.length);
            const isAhead = localChangesCount > 0;

            UI.hideLoading();
            this.showCommitDialog(gitContextItem, gitInfo, {
                isBehind, isAhead, localChangesCount, changeSet, remoteChanges, fullScan
            });

        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Error checking Git status: ${e.message}`, 'error');
            console.error(e);
        }
    },

    async showCommitDialog(gitContextItem, gitInfo, { isBehind, changeSet, remoteChanges, fullScan }) {
        const dirtyFiles = changeSet.dirtyFiles || [];
        const conflicts = changeSet.conflicts || [];
        const inscribedChanges = [...changeSet.creations, ...changeSet.updates, ...changeSet.deletions];
        const hasDirty = dirtyFiles.length > 0;
        const hasInscribed = inscribedChanges.length > 0;
        const hasConflicts = conflicts.length > 0;
        const isAhead = hasDirty || hasInscribed;
        const localChangesCount = new Set([...dirtyFiles.map(f => f.relativePath), ...inscribedChanges.map(f => f.path)]).size;

        let localStatusMessage = isAhead ? `${localChangesCount} change(s) detected` : 'In sync with remote';
        if (isBehind) localStatusMessage = "Out of date with remote";
        if (hasConflicts) localStatusMessage = `<span style="color:var(--color-accent-danger)">⚠️ CONFLICTS DETECTED</span>`;
        if (!fullScan && gitContextItem.type !== 'github') localStatusMessage += " <span style='font-size:0.8em; color:var(--color-text-tertiary)'> (Quick Scan)</span>";

        let statusHTML = `<div class="git-status-line">${localStatusMessage}</div>`;
        
        if (hasConflicts) {
            statusHTML += `<div class="changes-list" style="border-color: var(--color-accent-danger);">
                <strong>Conflicts (Remote differs from your base):</strong><ul>`;
            conflicts.forEach(c => statusHTML += `<li title="${c.reason}"><span class="tag deleted">CONFLICT</span> ${c.path}</li>`);
            statusHTML += `</ul></div>`;
        }

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

        // B"H - Add "Scan for External Changes" button via secondaryOk if it's a local clone and we haven't scanned yet
        if (!fullScan && gitContextItem.type !== 'github') {
            dialogConfig.secondaryOk = { text: 'Scan for External Changes', actionKey: 'full_scan' };
        } else if (hasDirty && hasInscribed && !hasConflicts) {
            dialogConfig.secondaryOk = { text: 'Commit Inscribed Only', actionKey: 'commit_inscribed' };
        }

        if (hasConflicts) {
            dialogConfig.okText = null; 
            dialogConfig.message = "You have unsaved changes that conflict with newer versions on the remote. Please back up your code, then discard changes or manually merge.";
        } else if (isBehind) {
            dialogConfig.okText = 'Pull & Overwrite Local Changes';
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

        const handleCommit = async (finalChangeSet, commitMessage) => {
            UI.showLoading("Committing to GitHub...");
            
            const newCommitSHA = await GitCommit.performCommit(gitContextItem, gitInfo, finalChangeSet, commitMessage);
            
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
            }
            
            UI.showToast("Changes committed successfully!", "success");
        };

        try {
            if (dialogResult === 'tertiary') await this.discardChanges(gitContextItem);
            else if (isBehind) FileOperations.pullAndOverwrite(gitContextItem, gitInfo);
            else if (isAhead && !hasConflicts) {
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
                    // Recalculate diff to ensure saved changes are picked up as updates
                    const finalChangeSet = await GitDiff.calculateDiff(gitContextItem, gitInfo, { fullScan });
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
    }
};