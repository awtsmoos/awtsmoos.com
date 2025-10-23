// B"H
// FILE: js/git-manager.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { FileSystemProvider } from './fs-provider.js';
import { Workspaces, getItemUniquePath } from './workspaces.js';
import { GitMetaProvider } from './git-meta-provider.js';
import { App } from './app.js';
import { FileOperations } from './file-operations.js';

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
    // B"H
// FILE: js/git-manager.js

// ... inside the GitManager object ...

    // REPLACE your existing showCommitDialog function with this one.
    async showCommitDialog(clonedFolderItem, gitInfo, { isBehind, isAhead, localChangesCount, changeSet }) {
        let statusHTML = `...`; // Your existing HTML generation is fine

        const commitMessage = `B"H\nBoruch Hashem!\nBiezras Hashem\nBlessed is He\nAt ${new Date()}`;
        
        // --- NEW LOGIC FOR DYNAMIC BUTTONS ---
        let okButtonText = '';
        let okButtonAction = null;
        let isOkButtonDestructive = false;

        if (isBehind) {
            okButtonText = 'Pull & Overwrite Local Changes';
            okButtonAction = 'pull';
            isOkButtonDestructive = true; // Make the button red
        } else if (isAhead) {
            okButtonText = 'Commit & Push Changes';
            okButtonAction = 'commit';
        }
        // --- END NEW LOGIC ---

        const dialogResult = await UI.showDialog({
            title: `Git Actions for ${clonedFolderItem.name}`,
            contentHTML: statusHTML,
            hasTextarea: isAhead && !isBehind, // Only show textarea if we can commit
            textareaContent: commitMessage,
            okText: okButtonText, // Use our dynamic text
            cancelText: 'Close'
        });

        // The dialog promise resolves with the input text OR just 'true' if no input.
        // It resolves with 'null' if canceled.
        if (dialogResult !== null) {
            if (okButtonAction === 'commit') {
                await this.performCommit(clonedFolderItem, gitInfo, dialogResult, changeSet);
            } else if (okButtonAction === 'pull') {
                // We now need to call a function to handle the pull.
                FileOperations.pullAndOverwrite(clonedFolderItem, gitInfo);
            }
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
    // B"H
// FILE: js/git-manager.js

// ... inside the GitManager object ...

// REPLACE your existing calculateDiff function with this one.
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

            // --- THE CRITICAL FIX IS HERE ---
            // We construct a full, valid item object for the read function,
            // combining the workspace context from `clonedFolderItem` with the specific file's path.
            const fullFileItem = { ...clonedFolderItem, path: localFile.path };
            const content = await FileSystemProvider.read(fullFileItem);
            // --- END FIX ---

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