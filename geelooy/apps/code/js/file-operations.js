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
async function _getDirectoryTree(sourceDir, workspace) {
    // The sourceDir is already correct, but its children will not be.
    const tree = { ...sourceDir, children: [] };
    const items = await FileSystemProvider.list(sourceDir);

    for (const item of items) {
        // THIS IS THE CRITICAL FIX: Build the child item from the TRUE workspace context.
        const fullItem = { ...workspace, ...item };

        if (item.kind === 'file') {
            const content = await FileSystemProvider.read(fullItem); // This will now succeed.
            tree.children.push({ ...fullItem, content });
        } else {
            // Pass the workspace down to the next level of recursion.
            tree.children.push(await _getDirectoryTree(fullItem, workspace));
        }
    }
    return tree;
}

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

async paste(destinationDir) {
    UI.showToast("starting to paste.", "warning");
        
    
    // 1. --- The First Guard: Is there anything on the clipboard? ---
    // This is the most likely cause of the previous silent failure.
    if (!State.fileClipboard || State.fileClipboard.length === 0) {
        console.warn("Paste cancelled: The file clipboard is empty.");
        UI.showToast("Clipboard is empty. Nothing to paste.", "warning");
        
        return; // EXIT POINT #1 (User feedback provided)
    }

    console.log(`PASTE INITIATED. Destination: '${destinationDir.path}'. Clipboard contains ${State.fileClipboard.length} uniquePath(s).`);

    // 2. --- Immediate UI Feedback: Acknowledge the User's Action ---
    // Let the user know the app has received the command, even before processing begins.
    
    UI.showToast("Preparing paste operation...");
    
    const destUniquePath = getItemUniquePath(destinationDir);
    const destEntry = State.domItemMap.get(destUniquePath);
    if (destEntry?.el) {
        const childrenContainer = destEntry.el.querySelector('ul');
        if (childrenContainer) {
            childrenContainer.innerHTML = `<li class="tree-item" style="--depth:${(destinationDir.path.match(/\//g) || []).length + 1};">Pasting...</li>`;
        }
    }
    
    // 3. --- The Unbreakable Container: try / catch / finally ---
    // The `finally` block GUARANTEES the UI will be cleaned up and refreshed, no matter what happens.
    try {
        // 4. --- Data Hydration: Get Fresh, Complete Item Objects ---
        // This is the most critical logic block for fixing the underlying error.
        console.log("Step 1: Hydrating item data from uniquePaths...", State.fileClipboard);
        const itemsToPaste = State.fileClipboard
            .map(uniquePath => {
                const item = State.domItemMap.get(uniquePath)?.item;
                if (!item) console.warn(`Could not find item in domItemMap for path: ${uniquePath}`);
                return item;
            })
            .filter(Boolean); // Filter out any items that were not found

        // 5. --- The Second Guard: Did we successfully find the items to paste? ---
        if (itemsToPaste.length === 0) {
            // This throws an error that will be caught and displayed by our robust error handler.
            throw new Error("Source items could not be found. The file view might be out of sync or items were deleted.");
        }
        
        console.log(`Step 2: Successfully hydrated ${itemsToPaste.length} item(s). Beginning file operations.`);

        // 6. --- Conflict Handling (Placeholder) ---
        const conflictHandler = async (item) => ({ action: 'overwrite' }); // Simplified for now

        // 7. --- The Core Operation Loop ---
        for (const sourceItem of itemsToPaste) {
            console.log(`- Processing paste for '${sourceItem.name}' (kind: ${sourceItem.kind}).`);

            const sourceWorkspace = State.workspaces.find(ws => ws.id === sourceItem.workspaceId);
        if (!sourceWorkspace) {
            throw new Error(`Could not find the source workspace for '${sourceItem.name}'.`);
        }

        // Safety Check (remains the same)
        if (sourceItem.workspaceId === destinationDir.workspaceId && sourceItem.kind === 'directory') {
            if (destinationDir.path === sourceItem.path || destinationDir.path.startsWith(`${sourceItem.path}/`)) {
                throw new Error(`Cannot paste '${sourceItem.name}' into a subdirectory of itself.`);
            }
        }
        
        if (sourceItem.kind === 'file') {
            // Reading the file directly in the _writeFile helper doesn't happen,
            // so we must read its content here first.
            const fileContent = await FileSystemProvider.read(sourceItem);
            const fileNode = { ...sourceItem, content: fileContent };
            await _writeFile(fileNode, destinationDir, conflictHandler);
        } else if (sourceItem.kind === 'directory') {
            // Here is where we call our improved recursive function.
            // We pass it the item AND the correct workspace context.
            const tree = await _getDirectoryTree(sourceItem, sourceWorkspace);
            await _writeDirectoryTree(tree, destinationDir, conflictHandler);
        }

        console.log(`- Successfully processed '${sourceItem.name}'.`);
    }

        // 8. --- Final Success Message ---
        console.log(`PASTE SUCCEEDED. Pasted ${itemsToPaste.length} item(s).`);
        UI.showToast(`Successfully pasted ${itemsToPaste.length} item(s)!`, "success");

    } catch (e) {
        // 9. --- EXTREME Error Reporting ---
        // This will catch any error from anywhere inside the 'try' block and display it.
        console.error("PASTE OPERATION FAILED. Full error object:", e);

        const message = e?.message || "An unknown error occurred. Check the console for details.";
        const stack = e?.stack ? `\n\nStack Trace:\n${e.stack}` : "\n\n(No stack trace available)";
        UI.showToast(`Paste failed: ${message}${stack}`, 'error', 15000); // Show for 15 seconds

    } finally {
        // 10. --- Guaranteed Cleanup & Refresh ---
        // This runs whether the paste succeeded or failed, ensuring the UI is never left in a broken state.
        console.log("Running final cleanup and UI refresh.");
        UI.showToast("did  paste.", "warning");
        
        await Workspaces.refreshNode(destinationDir);
    }
}




};