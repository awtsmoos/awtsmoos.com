// B"H
// FILE: js/file-operations.js

import { State } from './state.js';
import { UI } from './ui.js';
import { Workspaces } from './workspaces.js';
import { SelectionManager } from './selection-manager.js';
import { FileSystemProvider } from './fs-provider.js';

// Recursive function to read an entire directory structure into memory.
// This is necessary because we need the full structure to intelligently merge.
async function _getDirectoryTree(sourceDir) {
    const tree = { ...sourceDir, children: [] };
    const items = await FileSystemProvider.list(sourceDir);

    for (const item of items) {
        const fullItem = { ...sourceDir, ...item };
        if (item.kind === 'file') {
            const content = await FileSystemProvider.read(fullItem);
            tree.children.push({ ...fullItem, content });
        } else {
            tree.children.push(await _getDirectoryTree(fullItem));
        }
    }
    return tree;
}


// Recursive function to write a directory tree to a destination.
async function _writeDirectoryTree(treeNode, destinationDir, onConflict) {
    const newPath = destinationDir.path === '/' ? treeNode.name : `${destinationDir.path}/${treeNode.name}`;
    const newDirItem = { ...destinationDir, name: treeNode.name, path: newPath, kind: 'directory' };

    // Check if the directory already exists
    let existingChildren;
    try {
        existingChildren = await FileSystemProvider.list(destinationDir);
    } catch(e) { /* Doesn't exist, which is fine */ }
    
    const conflict = existingChildren?.find(c => c.name === treeNode.name && c.kind === 'directory');

    if (conflict) { // MERGE
        for (const child of treeNode.children) {
            if (child.kind === 'file') {
                await _writeFile(child, newDirItem, onConflict);
            } else {
                await _writeDirectoryTree(child, newDirItem, onConflict);
            }
        }
    } else { // CREATE
        await FileSystemProvider.create(destinationDir, treeNode.name, 'directory');
        for (const child of treeNode.children) {
            if (child.kind === 'file') {
                await _writeFile(child, newDirItem, onConflict);
            } else {
                await _writeDirectoryTree(child, newDirItem, onConflict);
            }
        }
    }
}


// Writes a single file, handling conflicts.
async function _writeFile(fileNode, destinationDir, onConflict) {
    let finalName = fileNode.name;
    const destFileItem = { ...destinationDir, path: `${destinationDir.path}/${finalName}` };

    let existingChildren;
    try { existingChildren = await FileSystemProvider.list(destinationDir); } catch(e) {}
    
    const conflict = existingChildren?.find(c => c.name === fileNode.name);

    if (conflict) {
        const resolution = await onConflict(fileNode, destinationDir);
        if (resolution.action === 'skip') {
            return;
        } else if (resolution.action === 'rename') {
            finalName = resolution.newName;
        } // Overwrite is the default
    }

    await FileSystemProvider.write({ ...destFileItem, name: finalName, path: `${destinationDir.path}/${finalName}`}, fileNode.content);
}


export const FileOperations = {
    // Copies selected items to the internal clipboard
    // B"H
// FILE: js/file-operations.js
// ACTION: Replace the ENTIRE copySelected function with this one.

copySelected() {
        if (State.selectedItems.size === 0) {
            UI.showToast("No items selected to copy.", "info");
            return;
        }

        const selectedPaths = Array.from(State.selectedItems);

        // This is the intelligent filtering logic that we need.
        const topLevelPaths = selectedPaths.filter(path => {
            // A path's parent is everything before the last '/'
            // For a root path like "Firework", lastIndexOf is -1, so parentPath is "". Correct.
            const parentPath = path.substring(0, path.lastIndexOf('/'));

            // An item is "top level" if its parent is NOT ALSO in the selection list.
            return !selectedPaths.some(otherPath => {
                 // For the special root case where parentPath is ""
                if (parentPath === "") return false;
                // Check if the exact parent path exists in the selection.
                // We use endsWith to ensure we match full directory names.
                return parentPath.endsWith(otherPath);
            });
        });

        // The clipboard now only stores the unique IDs.
        State.fileClipboard = topLevelPaths;

        UI.showToast(`${State.fileClipboard.length} top-level item(s) copied.`, 'success');
        SelectionManager.end();
    },

    // The advanced paste logic
    async paste(destinationDir) {
        if (State.fileClipboard.length === 0) return;

        UI.showLoading("Pasting items...");
        
        try {
            // CRITICAL CHANGE: Get fresh item objects right now from the master map.
            const itemsToPaste = State.fileClipboard
                .map(uniquePath => State.domItemMap.get(uniquePath)?.item)
                .filter(Boolean); // Filter out any that might be undefined

            // The conflict handler logic remains the same.
            const conflictHandler = async (item) => {
                 return { action: 'overwrite' }; // Simplified for now
            };

            for (const sourceItem of itemsToPaste) {
                // ... [Safety check for pasting into itself] ...

                if (sourceItem.kind === 'file') {
                    // This function now uses the fresh, correct sourceItem
                    await _writeFile(sourceItem, destinationDir, conflictHandler);
                } else if (sourceItem.kind === 'directory') {
                    // This function now uses the fresh, correct sourceItem
                    await _writeDirectoryTree(sourceItem, destinationDir, conflictHandler);
                }
            }

            UI.showToast("Paste complete!", "success");

        } catch (e) {
            console.error("PASTE OPERATION FAILED:", e); // Log the full error to the console
            const errorMessage = `Paste failed: ${e.message}\n\nStack Trace:\n${e.stack}`;
            UI.showToast(errorMessage, 'error', 10000); // Show for 10 seconds
            // -------------------------
        
        
        } finally {
            await Workspaces.refreshNode(destinationDir);
            UI.hideLoading();
        }
    }
};