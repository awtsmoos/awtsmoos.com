// B"H
// FILE: js/git-manager.js

import { State } from './state.js';
import { UI } from './ui.js';
import { FileSystemProvider } from './fs-provider.js';
import { Workspaces } from './workspaces.js';
import { GitMetaProvider } from './git-meta-provider.js';


export const GitManager = {
    /**
     * The main entry point to show the Git actions UI for a cloned workspace.
     */
    async showGitUI(clonedFolderItem) {
        UI.showLoading("Reading repository data...");
        // Get the Git metadata fresh from the ikar.js file.
        const gitInfo = await GitMetaProvider.getGitInfoForFolder(clonedFolderItem);

        if (!gitInfo) {
            UI.hideLoading();
            UI.showToast("This is not a cloned repository folder.", "error");
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
    // B"H
// FILE: js/git-manager.js

// REPLACE the existing calculateDiff method with this one.
    async calculateDiff(workspace) {
        // Now uses the abstract provider method, works for any workspace type.
        const localFiles = await FileSystemProvider.listAllFiles(workspace);
        const remoteTree = workspace.remoteTree; // Stored during clone

        const localFileMap = new Map(localFiles.map(f => [f.path, f]));
        const remoteFileMap = new Map(remoteTree.map(f => [f.path, f]));

        const changeSet = { creations: [], updates: [], deletions: [] };

        // Process creations and updates by reading from the local workspace
        for (const localFilePath of localFileMap.keys()) {
            // Reconstruct the full item to pass to the provider's read method
            const itemToRead = { ...workspace, path: localFilePath };
            const content = await FileSystemProvider.read(itemToRead);

            if (!remoteFileMap.has(localFilePath)) {
                changeSet.creations.push({ path: localFilePath, content });
            } else {
                // A more robust solution would compare content hashes (SHAs).
                // For this implementation, we assume any file present locally that was
                // also present remotely is a potential update. The Git Tree API
                // will ultimately ignore files with identical content.
                changeSet.updates.push({ path: localFilePath, content });
            }
        }
        
        // Process deletions
        for (const remoteFilePath of remoteFileMap.keys()) {
            if (!localFileMap.has(remoteFilePath)) {
                changeSet.deletions.push({ path: remoteFilePath });
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

