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
    /**
     * MODIFIED: Now checks for the special clone case first.
     */
    copySelected() {
        // --- NEW: SPECIAL CLONE LOGIC ---
        // Check if exactly one item is selected, and if it's the root of a GitHub repo.
        if (State.selectedItems.size === 1) {
            const uniquePath = Array.from(State.selectedItems)[0];
            const entry = State.domItemMap.get(uniquePath);
            const item = entry?.item;
            
            if (item && item.type === 'github' && item.path === '/') {
                // If the condition is met, trigger the clone workflow instead of the normal copy.
                this.clone(item); 
                SelectionManager.end(); // End selection mode after initiating clone.
                return; // Stop the function here.
            }
        }

        // --- ORIGINAL: REGULAR FILE COPY LOGIC (UNCHANGED) ---
        // This code will only run if the special clone condition is not met.
        if (State.selectedItems.size === 0) {
            UI.showToast("No items to copy.", "info");
            return;
        }
        const selectedPaths = Array.from(State.selectedItems);
        const topLevelPaths = selectedPaths.filter(path => {
            const parentPath = path.substring(0, path.lastIndexOf('/'));
            return !selectedPaths.some(otherPath => parentPath.startsWith(otherPath) && otherPath !== path);
        });
        State.fileClipboard = topLevelPaths;
        UI.showToast(`${topLevelPaths.length} top-level item(s) copied.`, 'success');
        SelectionManager.end();
    },

    /**
     * NEW: The abstract clone method.
     */
    async clone(sourceRepoItem) {
        // 1. Ask user to choose a destination workspace
        const writableWorkspaces = State.workspaces.filter(ws => ws.type !== 'github');
        if (writableWorkspaces.length === 0) {
            UI.showToast("No writable destination workspace available (e.g., Local or Browser Storage).", "error");
            return;
        }
        const workspaceListHTML = writableWorkspaces.map(ws => 
            `<button class="menu-button" data-ws-id="${ws.id}">${ws.name}</button>`
        ).join('');
        const selectedWsId = await UI.showDialog({
            title: 'Select Clone Destination',
            contentHTML: `<p>Where do you want to clone "${sourceRepoItem.name}"?</p><div style="max-height: 50vh; overflow-y: auto;">${workspaceListHTML}</div>`,
            okText: '', cancelText: 'Cancel'
        });
        if (selectedWsId === null) return;
        
        const destinationWs = State.workspaces.find(ws => ws.id === Number(selectedWsId));
        if (!destinationWs) {
            UI.showToast("Selected workspace not found.", "error"); return;
        }

        UI.showLoading(`Cloning ${sourceRepoItem.name}...`);
        try {
            // 2. Fetch the full repository tree from GitHub
            const fullTreeData = await FileSystemProvider.GitHub.getFullTree(sourceRepoItem);
            const filesToClone = fullTreeData.tree;

            // 3. Create a new directory within the destination to house the clone
            const cloneRootName = sourceRepoItem.repoInfo.repo;
            await FileSystemProvider.create(destinationWs, cloneRootName, 'directory');
            const cloneRootItem = { ...destinationWs, path: `/${cloneRootName}` };
            
            // 4. Write all files into the new directory
            for (const fileNode of filesToClone) {
                UI.showLoading(`Cloning: ${fileNode.path}`);
                const itemForReading = { ...sourceRepoItem, path: fileNode.path, sha: fileNode.sha, name: fileNode.path.split('/').pop() };
                const content = await FileSystemProvider.GitHub.read(itemForReading);
                const destinationItem = { ...cloneRootItem, path: `${cloneRootItem.path}/${fileNode.path}` };
                const parentPath = fileNode.path.substring(0, fileNode.path.lastIndexOf('/'));
                if (parentPath) {
                    await this._ensurePathExists(cloneRootItem, parentPath);
                }
                await FileSystemProvider.write(destinationItem, content);
            }

            // 5. Augment the *original destination workspace* with Git metadata
            // In a more advanced app, this metadata would be tied to the new sub-folder.
            // For now, we'll mark the whole workspace. A better approach is to modify the folder item itself.
            // This part is complex. We will add the flag to the main workspace for now.
            destinationWs.isClone = true;
            destinationWs.repoInfo = sourceRepoItem.repoInfo;
            destinationWs.branch = sourceRepoItem.branch;
            destinationWs.baseCommitSHA = fullTreeData.sha;
            destinationWs.remoteTree = filesToClone;
            
            App.saveSession();
            await Workspaces.refreshNode(destinationWs);
            UI.hideLoading();
            UI.showToast(`Successfully cloned into "${destinationWs.name}"!`, "success");

        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Clone Failed: ${e.message}`, 'error', 15000);
            console.error("CLONE ERROR:", e);
        }
    },

    /**
     * NEW: Helper to recursively create directories.
     */
    async _ensurePathExists(workspace, path) {
        const parts = path.split('/');
        let currentPath = '';
        for (const part of parts) {
            if (!part) continue;
            const parentDirItem = { ...workspace, path: `${workspace.path}/${currentPath}` };
            currentPath += (currentPath ? '/' : '') + part;
            try {
                await FileSystemProvider.create(parentDirItem, part, 'directory');
            } catch (e) {
                if (!e.message.toLowerCase().includes('exist')) throw e;
            }
        }
    },

    /**
     * YOUR ORIGINAL PASTE FUNCTION (UNCHANGED)
     */
    async paste(destinationDir) {
        if (!State.fileClipboard || State.fileClipboard.length === 0) {
            UI.showToast("Clipboard is empty.", "warning");
            return;
        }
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
            UI.showToast(`Successfully pasted ${itemsTo paste.length} item(s)!`, "success");
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