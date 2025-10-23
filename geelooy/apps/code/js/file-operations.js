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
    // This function is no longer needed, its logic is now in the menus.
    // copySelected() { ... } 

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
    async clone(sourceRepoItem, destinationDir) {
        UI.showLoading(`Preparing to clone ${sourceRepoItem.name}...`);
        try {
            const fullTreeData = await FileSystemProvider.GitHub.getFullTree(sourceRepoItem);
            const filesToClone = fullTreeData.tree;
            if (!filesToClone || typeof filesToClone[Symbol.iterator] !== 'function') {
                throw new Error("Could not retrieve a valid file list from the repository.");
            }

            // FIX: Create the new repo folder *inside* the destination directory.
            const cloneRootName = sourceRepoItem.repoInfo.repo;
            await FileSystemProvider.create(destinationDir, cloneRootName, 'directory');
            
            // FIX: Define the new root item with the correct path.
            const cloneRootPath = destinationDir.path === '/' ? `/${cloneRootName}` : `${destinationDir.path}/${cloneRootName}`;
            const cloneRootItem = { ...destinationDir, path: cloneRootPath, name: cloneRootName, kind: 'directory' };
            
            // Write all files into the new directory
            for (const fileNode of filesToClone) {
                // ENHANCEMENT: Show detailed progress.
                const fileSize = fileNode.size ? `(${(fileNode.size / 1024).toFixed(1)} KB)` : '';
                UI.showLoading(`Cloning: ${fileNode.path} ${fileSize}`);

                const itemForReading = { ...sourceRepoItem, path: fileNode.path, sha: fileNode.sha, name: fileNode.path.split('/').pop() };
                const content = await FileSystemProvider.GitHub.read(itemForReading);

                // FIX: Ensure the destination path for the file is correct.
                const destinationItem = { ...cloneRootItem, path: `${cloneRootItem.path}/${fileNode.path}` };
                const parentPath = fileNode.path.substring(0, fileNode.path.lastIndexOf('/'));
                
                if (parentPath) {
                    // FIX: Ensure subdirectories are created relative to the new clone root.
                    await this._ensurePathExists(cloneRootItem, parentPath);
                }
                
                await FileSystemProvider.write(destinationItem, content);
            }

            // Mark the PARENT WORKSPACE as a clone. This is a simplification for now.
            const parentWorkspace = State.workspaces.find(ws => ws.id === destinationDir.workspaceId);
            if (parentWorkspace) {
                parentWorkspace.isClone = true;
                parentWorkspace.repoInfo = sourceRepoItem.repoInfo;
                parentWorkspace.branch = sourceRepoItem.branch;
                parentWorkspace.baseCommitSHA = fullTreeData.sha;
                parentWorkspace.remoteTree = filesToClone;
            }
            
            App.saveSession();
            await Workspaces.refreshNode(destinationDir); // Refresh the folder we pasted into
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
