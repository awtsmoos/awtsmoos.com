// B"H
// FILE: js/git-manager.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { FileSystemProvider } from './fs-provider.js';
import { Workspaces, getItemUniquePath } from './workspaces.js';
import { GitMetaProvider } from './git-meta-provider.js';
import { App } from './app.js';

export const GitManager = {
    /**
     * Entry point. Called when the Git Actions button on a folder is clicked.
     */
    async showGitUI(clonedFolderItem) {
        UI.showLoading("Reading repository data...");
        const gitInfo = await GitMetaProvider.getGitInfoForFolder(clonedFolderItem);

        if (!gitInfo) {
            UI.hideLoading();
            UI.showToast("This is not a cloned repository folder.", "error");
            return;
        }

        UI.showLoading("Analyzing repository status...");

        try {
            const remoteCommitSHA = await FileSystemProvider.GitHub.getLatestCommitSHA(gitInfo);
            const isBehind = remoteCommitSHA !== gitInfo.baseCommitSHA;

            const changeSet = await this.calculateDiff(clonedFolderItem, gitInfo);
            const localChangesCount = (changeSet.creations.length + changeSet.updates.length + changeSet.deletions.length);
            const isAhead = localChangesCount > 0;

            UI.hideLoading();
            this.showCommitDialog(clonedFolderItem, gitInfo, { isBehind, isAhead, localChangesCount, changeSet });

        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Error checking Git status: ${e.message}`, 'error');
            console.error(e);
        }
    },

    /**
     * Displays the dialog with status and commit options.
     * This version is updated to work with folders and gitInfo.
     */
    async showCommitDialog(clonedFolderItem, gitInfo, { isBehind, isAhead, localChangesCount, changeSet }) {
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

        const commitMessage = `B"H\nBoruch Hashem!\nBiezras Hashem\nBlessed is He\nAt ${new Date()}`;
        
        const commitResult = await UI.showDialog({
            title: `Git Actions for ${clonedFolderItem.name}`,
            contentHTML: statusHTML,
            hasTextarea: isAhead && !isBehind,
            textareaContent: commitMessage,
            okText: isAhead && !isBehind ? 'Commit & Push Changes' : '',
            cancelText: 'Close'
        });

        if (commitResult && isAhead && !isBehind) {
            // Call the corrected performCommit function
            await this.performCommit(clonedFolderItem, gitInfo, commitResult, changeSet);
        }
    },

    /**
     * Performs the multi-file commit and updates the local metadata.
     * This version is updated to work with folders and gitInfo.
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

            // CRITICAL: Update the ikar.js file with the new state
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
     * Calculates the difference between local files and remote state.
     * This is the corrected version that uses relative paths.
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

            // Skip our internal metadata file from the diff
            if (relativePath.startsWith('.awtsmoos-repo')) continue;

            const content = await FileSystemProvider.read(localFile);
            if (!remoteFileMap.has(relativePath)) {
                changeSet.creations.push({ path: relativePath, content });
            } else {
                changeSet.updates.push({ path: relativePath, content });
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