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
    // B"H
// FILE: js/file-operations.js
// ACTION: Replace the entire 'paste' function with this one.

async paste(destinationDir) {
    // 1. --- Guard Clause ---
    // Make sure there's something to paste.
    if (State.fileClipboard.length === 0) return;

    // 2. --- UI Preparation ---
    // Give the user instant feedback that the operation has started.
    UI.showLoading("Pasting items...");
    const destUniquePath = getItemUniquePath(destinationDir);
    const destEntry = State.domItemMap.get(destUniquePath);
    if (destEntry?.el) {
        // This makes the UI feel much more responsive on large pastes.
        const childrenContainer = destEntry.el.querySelector('ul');
        if (childrenContainer) {
            childrenContainer.innerHTML = `<li class="tree-item" style="--depth:${(destinationDir.path.match(/\//g) || []).length + 1}; color: var(--color-text-tertiary);">Pasting...</li>`;
        }
    }

    try {
        // 3. --- The Critical Fix: Get Fresh Data ---
        // Instead of using potentially old item objects, we get the fresh ones
        // directly from the master domItemMap using the IDs stored on the clipboard.
        // This guarantees we have the correct `handle` for Local Folders.
        const itemsToPaste = State.fileClipboard
            .map(uniquePath => State.domItemMap.get(uniquePath)?.item)
            .filter(Boolean); // Filter out any that might be missing

        if (itemsToPaste.length === 0) {
            throw new Error("Source items could not be found in the application state.");
        }
        
        // 4. --- Conflict Handling (Placeholder) ---
        // This is where the "Overwrite/Skip/Rename" dialog would be triggered.
        // For now, it defaults to overwriting.
        const conflictHandler = async (item, destDir) => {
            // TODO: Implement a real UI.showDialog here for user choice.
            return { action: 'overwrite' };
        };

        // 5. --- The Core Operation Loop ---
        for (const sourceItem of itemsToPaste) {
            // Safety Check: Prevent pasting a folder into itself.
            if (sourceItem.workspaceId === destinationDir.workspaceId && sourceItem.kind === 'directory') {
                if (destinationDir.path === sourceItem.path || destinationDir.path.startsWith(`${sourceItem.path}/`)) {
                    throw new Error(`Cannot paste '${sourceItem.name}' into itself.`);
                }
            }

            if (sourceItem.kind === 'file') {
                await _writeFile(sourceItem, destinationDir, conflictHandler);
            } else if (sourceItem.kind === 'directory') {
                await _writeDirectoryTree(sourceItem, destinationDir, conflictHandler);
            }
        }

        UI.showToast("Paste complete!", "success");

    } catch (e) {
        // 6. --- Robust Error Reporting ---
        console.error("PASTE OPERATION FAILED:", e); // Log the full error object for debugging.

        // Build a helpful error message, safely checking if `e.stack` exists.
        const message = e?.message || "An unknown error occurred.";
        const stack = e?.stack ? `\n\nStack Trace:\n${e.stack}` : "\n\n(No stack trace available)";
// B"H
// FILE: js/file-operations.js
// ACTION: Make sure your 'paste' function looks exactly like this one.

async paste(destinationDir) {
    if (State.fileClipboard.length === 0) return;

    UI.showLoading("Pasting items...");
    // ... (UI preparation code for 'Pasting...' message in the tree) ...
    const destUniquePath = getItemUniquePath(destinationDir);
    const destEntry = State.domItemMap.get(destUniquePath);
    if (destEntry?.el) {
        const childrenContainer = destEntry.el.querySelector('ul');
        if (childrenContainer) {
            childrenContainer.innerHTML = `<li class="tree-item" style="--depth:${(destinationDir.path.match(/\//g) || []).length + 1};">Pasting...</li>`;
        }
    }
    
    try {
        // --- THIS IS THE CRITICAL FIX FOR THE PASTE ERROR ---
        const itemsToPaste = State.fileClipboard
            .map(uniquePath => State.domItemMap.get(uniquePath)?.item)
            .filter(Boolean);

        if (itemsToPaste.length === 0) throw new Error("Source items could not be found.");
        
        const conflictHandler = async (item) => ({ action: 'overwrite' });

        for (const sourceItem of itemsToPaste) {
            // ... (safety checks and loop logic) ...
             if (sourceItem.kind === 'file') {
                await _writeFile(sourceItem, destinationDir, conflictHandler);
            } else if (sourceItem.kind === 'directory') {
                await _writeDirectoryTree(sourceItem, destinationDir, conflictHandler);
            }
        }
        UI.showToast("Paste complete!", "success");

    } catch (e) {
        // ... (robust error handling) ...
        console.error("PASTE FAILED:", e);
        const message = e?.message || "An unknown error occurred.";
        UI.showToast(`Paste failed: ${message}`, 'error');
    } finally {
        UI.hideLoading();
        await Workspaces.refreshNode(destinationDir);
    }
}




};