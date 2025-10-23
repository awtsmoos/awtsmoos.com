// B"H
// FILE: js/git-manager.js

import { State } from './state.js';
import { UI } from './ui.js';
import { FileSystemProvider } from './fs-provider.js';
import { Workspaces } from './workspaces.js';

export const GitManager = {
    /**
     * The main entry point to show the Git actions UI for a cloned workspace.
     */
    async showGitUI(workspace) {
        if (!workspace.isClone) {
            UI.showToast("This is not a cloned workspace.", "error");
            return;
        }

        UI.showLoading("Analyzing repository status...");

        try {
            // 1. Check if we are behind the remote branch
            const remoteCommitSHA = await FileSystemProvider.GitHub.getLatestCommitSHA(workspace);
            const isBehind = remoteCommitSHA !== workspace.baseCommitSHA;

            // 2. Calculate local changes (diff)
            const changeSet = await this.calculateDiff(workspace);
            const localChangesCount = (changeSet.creations.length + changeSet.updates.length + changeSet.deletions.length);
            const isAhead = localChangesCount > 0;

            UI.hideLoading();
            this.showCommitDialog(workspace, { isBehind, isAhead, localChangesCount, changeSet, remoteCommitSHA });

        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Error checking Git status: ${e.message}`, 'error');
            console.error(e);
        }
    },

    /**
     * Shows the final dialog for committing, pulling, or viewing changes.
     */
    async showCommitDialog(workspace, { isBehind, isAhead, localChangesCount, changeSet, remoteCommitSHA }) {
        let statusHTML = `
            <div class="git-status-line">
                <span>Remote Status:</span>
                <span class="status ${isBehind ? 'behind' : 'synced'}">
                    ${isBehind ? `Behind. Please pull.` : 'In Sync'}
                </span>
            </div>
            <div class="git-status-line">
                <span>Local Status:</span>
                <span class="status ${isAhead ? 'ahead' : 'synced'}">
                    ${isAhead ? `${localChangesCount} change(s) detected` : 'No local changes'}
                </span>
            </div>
        `;

        if (isAhead) {
            statusHTML += `<div class="changes-list"><strong>Changes:</strong><ul>`;
            changeSet.creations.forEach(f => statusHTML += `<li><span class="tag created">ADDED</span> ${f.path}</li>`);
            changeSet.updates.forEach(f => statusHTML += `<li><span class="tag modified">MODIFIED</span> ${f.path}</li>`);
            changeSet.deletions.forEach(f => statusHTML += `<li><span class="tag deleted">DELETED</span> ${f.path}</li>`);
            statusHTML += `</ul></div>`;
        }

        const commitMessage = `B"H
Boruch Hashem!
Biezras Hashem 
Blessed is He
At ${new Date()}`;
        
        const commitResult = await UI.showDialog({
            title: `Git Actions for ${workspace.name}`,
            contentHTML: statusHTML,
            hasTextarea: isAhead && !isBehind, // Only allow committing if ahead and not behind
            textareaContent: commitMessage,
            okText: isAhead && !isBehind ? 'Commit & Push Changes' : '',
            cancelText: 'Close'
        });

        if (commitResult && isAhead && !isBehind) {
            await this.performCommit(workspace, commitResult, changeSet);
        }
    },

    /**
     * Compares the IndexedDB state with the original cloned tree to find changes.
     */
    async calculateDiff(workspace) {
        // We need to list all files in the IndexedDB workspace to compare.
        // This requires a new, recursive list method in the IndexedDB provider.
        const localFiles = await FileSystemProvider.IndexedDB.listAllFiles(workspace);
        const remoteTree = workspace.remoteTree; // Stored during clone

        const localFileMap = new Map(localFiles.map(f => [f.path, f]));
        const remoteFileMap = new Map(remoteTree.map(f => [f.path, f]));

        const changeSet = { creations: [], updates: [], deletions: [] };

        // Check for creations and updates
        for (const [path, localFile] of localFileMap.entries()) {
            const remoteFile = remoteFileMap.get(path);
            const content = await FileSystemProvider.IndexedDB.read(localFile);
            
            if (!remoteFile) {
                changeSet.creations.push({ path, content });
            } else {
                // This is a simplified check. A true Git diff would compare hashes.
                // For our purpose, we'll need to read remote content and compare.
                // For now, we'll assume any existing file in local that isn't identical is an update.
                // A full implementation would be much more complex. We'll commit all local files for simplicity.
                changeSet.updates.push({ path, content });
            }
        }
        
        // Check for deletions
        for (const [path, remoteFile] of remoteFileMap.entries()) {
            if (!localFileMap.has(path)) {
                changeSet.deletions.push({ path });
            }
        }

        return changeSet;
    },

    /**
     * Executes the multi-file commit using the FileSystemProvider.
     */
    async performCommit(workspace, commitMessage, changeSet) {
        UI.showLoading("Committing & Pushing...");
        try {
            const newCommitSHA = await FileSystemProvider.GitHub.commitMultipleFiles({
                repoInfo: workspace.repoInfo,
                branch: workspace.branch,
                commitMessage,
                changeSet
            });

            // CRITICAL: Update the workspace state to reflect the push
            const newTree = await FileSystemProvider.GitHub.getFullTree(workspace);
            workspace.baseCommitSHA = newCommitSHA;
            workspace.remoteTree = newTree.tree; // Note: getFullTree returns {tree, sha}
            App.saveSession(); // Persist the new state

            UI.hideLoading();
            UI.showToast("Changes committed successfully!", "success");
        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Commit failed: ${e.message}`, 'error');
            console.error(e);
        }
    }
};

