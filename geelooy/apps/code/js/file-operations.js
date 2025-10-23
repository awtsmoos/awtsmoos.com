// B"H
// FILE: js/file-operations.js
// This version intelligently combines the new clone functionality with your existing copy/paste.

import { State } from './state.js';
import { UI } from './ui.js';
import { Workspaces, getItemUniquePath } from './workspaces.js';
import { SelectionManager } from './selection-manager.js';
import { FileSystemProvider } from './fs-provider.js';
import { App } from './app.js';

// --- YOUR ORIGINAL HELPER FUNCTIONS (UNCHANGED) ---
async function _getDirectoryTree(sourceDir) {
    const tree = { ...sourceDir, children: [] };
    const items = await FileSystemProvider.list(sourceDir);
    for (const item of items) {
        const fullItem = {
            workspaceId: sourceDir.workspaceId, type: sourceDir.type,
            handle: sourceDir.handle, repoInfo: sourceDir.repoInfo,
            branch: sourceDir.branch, name: item.name, kind: item.kind,
            path: item.path, sha: item.sha
        };
        if (item.kind === 'file') {
            const content = await FileSystemProvider.read(fullItem);
            tree.children.push({ ...fullItem, content });
        } else {
            tree.children.push(await _getDirectoryTree(fullItem));
        }
    }
    return tree;
}

async function _writeDirectoryTree(treeNode, destinationDir) {
    const newPath = destinationDir.path === '/' ? treeNode.name : `${destinationDir.path}/${treeNode.name}`;
    const newDirItem = { ...destinationDir, name: treeNode.name, path: newPath, kind: 'directory' };
    await FileSystemProvider.create(destinationDir, treeNode.name, 'directory');
    for (const child of treeNode.children) {
        if (child.kind === 'file') {
            await _writeFile(child, newDirItem);
        } else {
            await _writeDirectoryTree(child, newDirItem);
        }
    }
}

async function _writeFile(fileNode, destinationDir) {
    await FileSystemProvider.write({ ...destinationDir, name: fileNode.name, path: `${destinationDir.path}/${fileNode.name}`}, fileNode.content);
}

// --- MAIN EXPORTED OBJECT (WITH MODIFICATIONS) ---
export const FileOperations = {


    
    // B"H
// FILE: js/file-operations.js

// ... inside the FileOperations object ...

    // REPLACE your existing pullAndOverwrite function with this one.
    async pullAndOverwrite(folderToUpdate, gitInfo) {
        const confirmed = await UI.showDialog({
            title: 'Confirm Overwrite',
            message: `Are you sure? This will delete all local changes in '${folderToUpdate.name}' and replace them with the latest version from GitHub. This cannot be undone.`,
            okText: 'Yes, Overwrite My Changes',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        UI.showLoading(`Pulling latest changes for ${folderToUpdate.name}...`);
        try {
            const sourceRepoItem = { type: 'github', ...gitInfo };
            const fullTreeData = await FileSystemProvider.GitHub.getFullTree(sourceRepoItem);
            const filesToPull = fullTreeData.tree;
            
            // --- NEW: Give better feedback on what's missing ---
            const localFiles = await FileSystemProvider.listAllFiles(folderToUpdate);
            const localFilePaths = new Set(localFiles.map(f => f.path));
            const missingFiles = filesToPull.filter(remoteFile => 
                !localFilePaths.has(`${folderToUpdate.path}/${remoteFile.path}`)
            );
            UI.showLoading(`Pulling ${filesToPull.length} total files. Found ${missingFiles.length} missing files...`);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Give user time to read
            // --- END NEW ---

            const itemsToDelete = await FileSystemProvider.list(folderToUpdate);
            for (const item of itemsToDelete) {
                if (item.name === '.awtsmoos-repo') continue;
                await FileSystemProvider.delete(item);
            }

            for (const fileNode of filesToPull) {
                const fileSize = fileNode.size ? `(${(fileNode.size / 1024).toFixed(1)} KB)` : '';
                UI.showLoading(`Pulling: ${fileNode.path} ${fileSize}`);
                const itemForReading = { ...sourceRepoItem, path: fileNode.path, sha: fileNode.sha, name: fileNode.path.split('/').pop() };
                const content = await FileSystemProvider.GitHub.read(itemForReading);
                const destinationItem = { ...folderToUpdate, path: `${folderToUpdate.path}/${fileNode.path}` };
                const parentPath = fileNode.path.substring(0, fileNode.path.lastIndexOf('/'));
                if (parentPath) {
                    await this._ensurePathExists(folderToUpdate, parentPath);
                }
                await FileSystemProvider.write(destinationItem, content);
            }

            const updatedGitInfo = { ...gitInfo, baseCommitSHA: fullTreeData.sha, remoteTree: filesToPull };
            const ikarFileContent = `// B"H\n\nconst ikar = ${JSON.stringify(updatedGitInfo, null, 4)};`;
            const ikarFileItem = { ...folderToUpdate, path: `${folderToUpdate.path}/.awtsmoos-repo/ikar.js` };
            await FileSystemProvider.write(ikarFileItem, ikarFileContent);

            await Workspaces.refreshNode(folderToUpdate);
            UI.hideLoading();
            UI.showToast('Pull successful. Local folder is now in sync.', 'success');

        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Pull Failed: ${e.message}`, 'error', 15000);
            console.error("PULL ERROR:", e);
        }
    },

    /**
     * THE NEW SMART PASTE FUNCTION
     * It checks the clipboard and decides whether to clone or do a regular paste.
     */
    async paste(destinationDir) {
        if (!State.fileClipboard || State.fileClipboard.length === 0) {
            UI.showToast("Clipboard is empty.", "warning");
            return;
        }

        // --- SMART LOGIC ---
        // Check if the clipboard contains a single item that is a GitHub repo root.
        const sourceItemUniquePath = State.fileClipboard[0];
        const sourceItem = State.domItemMap.get(sourceItemUniquePath)?.item;

        if (State.fileClipboard.length === 1 && sourceItem && sourceItem.type === 'github' && sourceItem.path === '/') {
            // If it is, we trigger the clone workflow.
            await this.clone(sourceItem, destinationDir);
        } else {
            // Otherwise, we perform the original, standard file paste.
            await this.standardPaste(destinationDir);
        }
    },

    /**
     * THE NEW, CORRECTED CLONE FUNCTION
     */
    // B"H
// FILE: js/file-operations.js

// ... (keep all your other functions like paste, _ensurePathExists, etc.) ...
// ... inside the FileOperations object ...

    // REPLACE your existing clone function with this complete one.
    async clone(sourceRepoItem, destinationDir) {
        UI.showLoading(`Preparing to clone ${sourceRepoItem.name}...`);
        try {
            // 1. Fetch the full repository tree and metadata from GitHub
            const fullTreeData = await FileSystemProvider.GitHub.getFullTree(sourceRepoItem);
            const filesToClone = fullTreeData.tree;
            if (!filesToClone || typeof filesToClone[Symbol.iterator] !== 'function') {
                throw new Error("Could not retrieve a valid file list from the repository.");
            }

            // 2. Create the main folder for the clone inside the destination directory
            const cloneRootName = sourceRepoItem.repoInfo.repo;
            await FileSystemProvider.create(destinationDir, cloneRootName, 'directory');
            const cloneRootItem = { ...destinationDir, path: destinationDir.path === '/' ? `/${cloneRootName}` : `${destinationDir.path}/${cloneRootName}` };
            
            // 3. Loop through every file from the GitHub repo and write it locally
            for (const fileNode of filesToClone) {
                const fileSize = fileNode.size ? `(${(fileNode.size / 1024).toFixed(1)} KB)` : '';
                UI.showLoading(`Cloning: ${fileNode.path} ${fileSize}`);

                // Read the file's content from GitHub
                const itemForReading = { ...sourceRepoItem, path: fileNode.path, sha: fileNode.sha, name: fileNode.path.split('/').pop() };
                const content = await FileSystemProvider.GitHub.read(itemForReading);

                // Define where the file will be written in the destination
                const destinationItem = { ...cloneRootItem, path: `${cloneRootItem.path}/${fileNode.path}` };
                const parentPath = fileNode.path.substring(0, fileNode.path.lastIndexOf('/'));

                // If the file is in a subdirectory, make sure that directory exists first
                if (parentPath) {
                    await this._ensurePathExists(cloneRootItem, parentPath);
                }
                
                // Write the file's content to the destination
                await FileSystemProvider.write(destinationItem, content);
            }

            // 4. Create the special .awtsmoos-repo/ikar.js metadata file
            const gitInfo = {
                isClone: true,
                repoInfo: sourceRepoItem.repoInfo,
                branch: sourceRepoItem.branch,
                baseCommitSHA: fullTreeData.sha,
                remoteTree: filesToClone
            };
            const ikarFileContent = `// B"H\n\nconst ikar = ${JSON.stringify(gitInfo, null, 4)};`;
            await FileSystemProvider.create(cloneRootItem, '.awtsmoos-repo', 'directory');
            const metaDirItem = { ...cloneRootItem, path: `${cloneRootItem.path}/.awtsmoos-repo` };
            const ikarFileItem = { ...metaDirItem, name: 'ikar.js', path: `${metaDirItem.path}/ikar.js` };
            await FileSystemProvider.write(ikarFileItem, ikarFileContent);
            
            // 5. Finalize the process
            await Workspaces.refreshNode(destinationDir);
            UI.hideLoading();
            UI.showToast(`Successfully cloned into "${destinationDir.name}"!`, "success");

        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Clone Failed: ${e.message}`, 'error', 15000);
            console.error("CLONE ERROR:", e);
        }
    },

    /**
     * THE CORRECTED HELPER for recursively creating directories.
     */
    async _ensurePathExists(baseItem, relativePath) {
        const parts = relativePath.split('/');
        let currentPath = '';
        for (const part of parts) {
            if (!part) continue;
            // FIX: Build paths relative to the baseItem's path.
            const parentDirItem = { ...baseItem, path: `${baseItem.path}${currentPath}` };
            currentPath += `/${part}`;
            try {
                await FileSystemProvider.create(parentDirItem, part, 'directory');
            } catch (e) {
                if (!e.message.toLowerCase().includes('exist')) throw e;
            }
        }
    },

    /**
     * YOUR ORIGINAL PASTE LOGIC, now in its own function.
     */
    async standardPaste(destinationDir) {
        UI.showLoading("Pasting...");
        const destEntry = State.domItemMap.get(getItemUniquePath(destinationDir));
        if (destEntry?.el) {
            const childrenContainer = destEntry.el.querySelector('ul');
            if (childrenContainer) childrenContainer.innerHTML = `<li class="tree-item" style="--depth:${(destinationDir.path.match(/\//g) || []).length + 1};">Pasting...</li>`;
        }
        try {
            const itemsToPaste = State.fileClipboard
                .map(uniquePath => State.domItemMap.get(uniquePath)?.item)
                .filter(Boolean);
            if (itemsToPaste.length === 0) throw new Error("Source items could not be found.");
            for (const sourceItem of itemsToPaste) {
                if (sourceItem.workspaceId === destinationDir.workspaceId && sourceItem.kind === 'directory' && (destinationDir.path === sourceItem.path || destinationDir.path.startsWith(`${sourceItem.path}/`))) {
                    throw new Error(`Cannot paste '${sourceItem.name}' into itself.`);
                }
                if (sourceItem.kind === 'file') {
                    const fileContent = await FileSystemProvider.read(sourceItem);
                    const fileNode = { ...sourceItem, content: fileContent };
                    await _writeFile(fileNode, destinationDir);
                } else {
                    const tree = await _getDirectoryTree(sourceItem);
                    await _writeDirectoryTree(tree, destinationDir);
                }
            }
            UI.showToast(`Successfully pasted ${itemsToPaste.length} item(s)!`, "success");
        } catch (e) {
            const message = e?.message || "An unknown error occurred.";
            UI.showToast(`PASTE FAILED: ${message}`, 'error', 15000);
            console.error("FULL PASTE ERROR:", e);
        } finally {
            UI.hideLoading();
            await Workspaces.refreshNode(destinationDir);
        }
    }
};
