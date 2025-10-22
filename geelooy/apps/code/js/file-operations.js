// B"H
// FILE: js/file-operations.js

import { State } from './state.js';
import { UI } from './ui.js';
import { Workspaces } from './workspaces.js';
import { SelectionManager } from './selection-manager.js';
import { FileSystemProvider } from './fs-provider.js';

// Recursive function to read an entire directory structure into memory.
// This is necessary because we need the full structure to intelligently merge.
// B"H
// FILE: js/file-operations.js

// ACTION: Modify this function to accept 'workspace'.

// The function now requires the 'workspace' object so it can build correct children.


// ... the other helper functions (_writeDirectoryTree, _writeFile) are OK.


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
// B"H
// FILE: js/file-operations.js
// ACTION: Replace the entire 'paste' function with this one.

// B"H
// FILE: js/file-operations.js

// ACTION 1: Replace the entire _getDirectoryTree helper function.
// This new version passes the workspace context correctly during recursion.
async function _getDirectoryTree(sourceDir, workspace) {
    const tree = { ...sourceDir, children: [] };
    const items = await FileSystemProvider.list(sourceDir);
    UI.showToast(`Reading ${items.length} children of '${sourceDir.name}'`);

    for (const item of items) {
        // THIS IS THE CRITICAL FIX from the last step, now with logging.
        const fullItem = { ...workspace, ...item };

        if (item.kind === 'file') {
            UI.showToast(`-- Reading file: ${fullItem.name}`, "info");
            const content = await FileSystemProvider.read(fullItem);
            tree.children.push({ ...fullItem, content });
        } else {
            UI.showToast(`-- Entering folder: ${fullItem.name}`, "info");
            // Pass the workspace down to the next level of recursion.
            tree.children.push(await _getDirectoryTree(fullItem, workspace));
        }
    }
    return tree;
}

// ... _writeDirectoryTree and _writeFile do not need changes ...

// ACTION 2: Replace the ENTIRE 'paste' function in the 'FileOperations' object.
async paste(destinationDir) {
    // 1. --- The First Guard ---
    if (!State.fileClipboard || State.fileClipboard.length === 0) {
        UI.showToast("Paste cancelled: Clipboard is empty.", "warning");
        return; 
    }
    
    // Announce the start of the entire process.
    UI.showToast(`PASTE INITIATED. Dest: '${destinationDir.name}'.`, "success");

    // 2. --- Immediate UI Feedback in the tree ---
    const destUniquePath = getItemUniquePath(destinationDir);
    const destEntry = State.domItemMap.get(destUniquePath);
    if (destEntry?.el) {
        const childrenContainer = destEntry.el.querySelector('ul');
        if (childrenContainer) {
            childrenContainer.innerHTML = `<li class="tree-item" style="--depth:${(destinationDir.path.match(/\//g) || []).length + 1};">Pasting...</li>`;
        }
    }
    
    // 3. --- The Unbreakable Container ---
    try {
        // 4. --- Data Hydration: Find the items in our state ---
        UI.showToast("Step 1: Locating items in app state...", "info");
        const itemsToPaste = State.fileClipboard
            .map(uniquePath => State.domItemMap.get(uniquePath)?.item)
            .filter(Boolean);

        // 5. --- The Second Guard ---
        if (itemsToPaste.length === 0) {
            throw new Error("Source items could not be found. View might be out of sync.");
        }
        UI.showToast(`Step 2: Found ${itemsToPaste.length} item(s). Beginning operations.`, "success");

        // 6. --- Conflict Handling ---
        const conflictHandler = async (item) => ({ action: 'overwrite' });

        // 7. --- The Core Operation Loop ---
        for (const sourceItem of itemsToPaste) {
            UI.showToast(`Processing '${sourceItem.name}'...`, "info");

            const sourceWorkspace = State.workspaces.find(ws => ws.id === sourceItem.workspaceId);
            if (!sourceWorkspace) {
                throw new Error(`Could not find the source workspace for '${sourceItem.name}'.`);
            }

            // Safety Check
            if (sourceItem.workspaceId === destinationDir.workspaceId && sourceItem.kind === 'directory') {
                if (destinationDir.path === sourceItem.path || destinationDir.path.startsWith(`${sourceItem.path}/`)) {
                    throw new Error(`Cannot paste '${sourceItem.name}' into itself.`);
                }
            }
            
            if (sourceItem.kind === 'file') {
                UI.showToast(`Reading content of file '${sourceItem.name}'...`, "info");
                const fileContent = await FileSystemProvider.read(sourceItem);
                const fileNode = { ...sourceItem, content: fileContent };

                UI.showToast(`Writing file '${sourceItem.name}' to destination...`, "info");
                await _writeFile(fileNode, destinationDir, conflictHandler);

            } else if (sourceItem.kind === 'directory') {
                UI.showToast(`Building tree for folder '${sourceItem.name}'...`, "info");
                const tree = await _getDirectoryTree(sourceItem, sourceWorkspace);
                
                UI.showToast(`Writing tree for '${sourceItem.name}' to destination...`, "info");
                await _writeDirectoryTree(tree, destinationDir, conflictHandler);
            }
            UI.showToast(`... Done processing '${sourceItem.name}'.`, "success", 1500); // Shorter success toast
        }

        // 8. --- Final Success Message ---
        UI.showToast(`PASTE SUCCEEDED. All ${itemsToPaste.length} item(s) processed!`, "success", 4000);

    } catch (e) {
        // 9. --- EXTREME Error Reporting ---
        const message = e?.message || "An unknown error occurred.";
        const stack = e?.stack ? `\nStack:\n${e.stack}` : " (No stack trace)";
        UI.showToast(`PASTE FAILED: ${message}${stack}`, 'error', 20000); // Show for 20 seconds

    } finally {
        // 10. --- Guaranteed Cleanup & Refresh ---
        UI.showToast("Finalizing... Refreshing view.", "info");
        await Workspaces.refreshNode(destinationDir);
    }
}




};