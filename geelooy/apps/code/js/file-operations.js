// B"H
// FILE: js/file-operations.js
// This structure is guaranteed to be parsed correctly by the browser before execution.

import { State } from './state.js';
import { UI } from './ui.js';
import { Workspaces, getItemUniquePath } from './workspaces.js';
import { SelectionManager } from './selection-manager.js';
import { FileSystemProvider } from './fs-provider.js';

// ========================================================================
// === 1. DEFINE ALL HELPER FUNCTIONS FIRST (GLOBAL TO THIS MODULE) ===
// ========================================================================
// By declaring these as standalone 'async function', they are "hoisted"
// and will be available everywhere within this file, solving the error.

async function _getDirectoryTree(sourceDir, workspace) {
    const tree = { ...sourceDir, children: [] };
    const items = await FileSystemProvider.list(sourceDir);

    for (const item of items) {
        const fullItem = { ...workspace, ...item };
        if (item.kind === 'file') {
            const content = await FileSystemProvider.read(fullItem);
            tree.children.push({ ...fullItem, content });
        } else {
            tree.children.push(await _getDirectoryTree(fullItem, workspace));
        }
    }
    return tree;
}

async function _writeDirectoryTree(treeNode, destinationDir, onConflict) {
    const newPath = destinationDir.path === '/' ? treeNode.name : `${destinationDir.path}/${treeNode.name}`;
    const newDirItem = { ...destinationDir, name: treeNode.name, path: newPath, kind: 'directory' };
    
    let existingChildren;
    try { existingChildren = await FileSystemProvider.list(destinationDir); } catch(e) {}
    const conflict = existingChildren?.find(c => c.name === treeNode.name && c.kind === 'directory');

    if (conflict) {
        for (const child of treeNode.children) {
            if (child.kind === 'file') {
                await _writeFile(child, newDirItem, onConflict);
            } else {
                await _writeDirectoryTree(child, newDirItem, onConflict);
            }
        }
    } else {
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

async function _writeFile(fileNode, destinationDir, onConflict) {
    let finalName = fileNode.name;
    let existingChildren;
    try { existingChildren = await FileSystemProvider.list(destinationDir); } catch(e) {}
    const conflict = existingChildren?.find(c => c.name === fileNode.name);

    if (conflict) {
        const resolution = await onConflict(fileNode, destinationDir);
        if (resolution.action === 'skip') return;
        if (resolution.action === 'rename') finalName = resolution.newName;
    }
    
    await FileSystemProvider.write({ ...destinationDir, name: finalName, path: `${destinationDir.path}/${finalName}`}, fileNode.content);
}

// ===========================================================
// === 2. DEFINE THE EXPORTED OBJECT (USES THE HELPERS) ===
// ===========================================================

export const FileOperations = {
    copySelected() {
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
        UI.showToast(`${State.fileClipboard.length} top-level item(s) copied.`, 'success');
        SelectionManager.end();
    },

    async paste(destinationDir) {
        // Remove ALL visual tracers. If this works, it works. If it fails,
        // the catch block is the only message we need to see.
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

            if (itemsToPaste.length === 0) {
                throw new Error("Source items could not be found.");
            }
            
            const conflictHandler = async (item) => ({ action: 'overwrite' });

            for (const sourceItem of itemsToPaste) {
                const sourceWorkspace = State.workspaces.find(ws => ws.id === sourceItem.workspaceId);
                if (!sourceWorkspace) {
                    throw new Error(`Cannot find source workspace for '${sourceItem.name}'.`);
                }

                if (sourceItem.workspaceId === destinationDir.workspaceId && sourceItem.kind === 'directory' && (destinationDir.path === sourceItem.path || destinationDir.path.startsWith(`${sourceItem.path}/`))) {
                    throw new Error(`Cannot paste '${sourceItem.name}' into itself.`);
                }
                
                if (sourceItem.kind === 'file') {
                    const fileContent = await FileSystemProvider.read(sourceItem);
                    const fileNode = { ...sourceItem, content: fileContent };
                    await _writeFile(fileNode, destinationDir, conflictHandler);
                } else { // It's a directory
                    const tree = await _getDirectoryTree(sourceItem, sourceWorkspace);
                    await _writeDirectoryTree(tree, destinationDir, conflictHandler);
                }
            }

            UI.showToast(`Successfully pasted ${itemsToPaste.length} item(s)!`, "success");

        } catch (e) {
            const message = e?.message || "An unknown error occurred.";
            UI.showToast(`PASTE FAILED: ${message}`, 'error', 15000);
            console.error("FULL PASTE ERROR:", e); // Put the console.error back just in case
        } finally {
            UI.hideLoading();
            await Workspaces.refreshNode(destinationDir);
        }
    }
};