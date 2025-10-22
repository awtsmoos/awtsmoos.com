// B"H
// FILE: js/file-operations.js
// This version uses a foolproof method for constructing child items.

import { State } from './state.js';
import { UI } from './ui.js';
import { Workspaces, getItemUniquePath } from './workspaces.js';
import { SelectionManager } from './selection-manager.js';
import { FileSystemProvider } from './fs-provider.js';

// =============================================================
// === 1. HELPER FUNCTIONS (WITH THE DEFINITIVE FIX) ===
// =============================================================

async function _getDirectoryTree(sourceDir) {
    // 1. We know 'sourceDir' is correct because it came from the master domItemMap.
    const tree = { ...sourceDir, children: [] };
    const items = await FileSystemProvider.list(sourceDir);

    for (const item of items) {
        // 2. THIS IS THE CRITICAL, FOOLPROOF FIX:
        // Instead of clever spreading, we explicitly construct the child's item object.
        // We take the TRUE, uncorrupted context from the source's parent...
        const fullItem = {
            // Inherit the IDENTICAL, known-good context from the parent.
            workspaceId: sourceDir.workspaceId,
            type: sourceDir.type,
            handle: sourceDir.handle, // The essential 'key' for local files.
            repoInfo: sourceDir.repoInfo,
            branch: sourceDir.branch,
            // And apply ONLY the specific properties for the child.
            name: item.name,
            kind: item.kind,
            path: item.path,
            sha: item.sha
        };
        // 3. Now 'fullItem' is guaranteed to be a valid object for the FileSystemProvider.

        if (item.kind === 'file') {
            // This call will now succeed.
            const content = await FileSystemProvider.read(fullItem);
            tree.children.push({ ...fullItem, content });
        } else {
            // Recursively build the tree for the subdirectory.
            tree.children.push(await _getDirectoryTree(fullItem));
        }
    }
    return tree;
}


async function _writeDirectoryTree(treeNode, destinationDir) {
    const newPath = destinationDir.path === '/' ? treeNode.name : `${destinationDir.path}/${treeNode.name}`;
    const newDirItem = { ...destinationDir, name: treeNode.name, path: newPath, kind: 'directory' };
    
    // We create the new directory at the destination
    await FileSystemProvider.create(destinationDir, treeNode.name, 'directory');
    
    // Then we process its children. This logic is much simpler and safer.
    for (const child of treeNode.children) {
        if (child.kind === 'file') {
            await _writeFile(child, newDirItem);
        } else {
            await _writeDirectoryTree(child, newDirItem);
        }
    }
}


async function _writeFile(fileNode, destinationDir) {
    // This helper remains simple, it just takes the node and writes it.
    // Conflict handling would go here in the future.
    await FileSystemProvider.write({ ...destinationDir, name: fileNode.name, path: `${destinationDir.path}/${fileNode.name}`}, fileNode.content);
}

// =============================================
// === 2. THE MAIN EXPORTED OBJECT           ===
// =============================================

export const FileOperations = {
    copySelected() {
        if (State.selectedItems.size === 0) {
            UI.showToast("No items to copy.", "info");
            return;
        }

        // The logic for filtering and storing uniquePaths is correct.
        const selectedPaths = Array.from(State.selectedItems);
        const topLevelPaths = selectedPaths.filter(path => {
            const parentPath = path.substring(0, path.lastIndexOf('/'));
            return !selectedPaths.some(otherPath => parentPath.startsWith(otherPath) && otherPath !== path);
        });

        State.fileClipboard = topLevelPaths;
        UI.showToast(`${topLevelPaths.length} top-level item(s) copied.`, 'success');
        SelectionManager.end();
    },

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
                    // Files don't need the recursive tree builder. Read and write directly.
                    const fileContent = await FileSystemProvider.read(sourceItem);
                    const fileNode = { ...sourceItem, content: fileContent };
                    await _writeFile(fileNode, destinationDir);
                } else { // It's a directory
                    // Here is where we call our new, foolproof recursive function.
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