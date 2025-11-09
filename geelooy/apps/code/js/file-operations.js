// B"H
// FILE: js/file-operations.js
// This version intelligently combines the new clone functionality with your existing copy/paste.
import { Tabs } from './tabs.js';
import { State } from './state.js';
import { UI } from './ui.js';
import { Workspaces, getItemUniquePath } from './workspaces.js';
import { SelectionManager } from './selection-manager.js';
import { FileSystemProvider } from './fs-provider.js';
import { App } from './app.js';
import { Clipboard } from './clipboard.js';

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
    /**
     * Copies the references of the currently selected items to the internal clipboard.
     * This prepares them for a subsequent 'paste' operation.
     */
    async copySelected() {
        // Get the unique paths from the selection state.
        const selectedPaths = Array.from(State.selectedItems);

        // Check if there's anything to copy.
        if (selectedPaths.length === 0) {
            UI.showToast("No items selected to copy.", "info");
            return;
        }

        // Store the array of unique paths in the file clipboard.
        State.fileClipboard = selectedPaths;

        // Let the user know the action was successful.
        UI.showToast(`${selectedPaths.length} item(s) copied to clipboard.`, 'success');

        // End the selection mode to provide a clean user experience.
        SelectionManager.end();
    },





    
    // B"H - IN: js/file-operations.js
// ACTION: Replace the entire function with this one.

async copyAllContents(items) {
    if (!items || items.length === 0) {
        UI.showToast("Nothing selected to copy.", "info");
        return;
    }

    UI.showLoading("Formatting as Markdown...");
    let combinedContent = 'B"H\n\n'; // Start with a single header for the whole document

    try {
        const processItem = async (item) => {
            if (!item || !item.kind) return;

            if (item.kind === 'file') {
                const content = await FileSystemProvider.read(item);
                let textContent = '';

                if (typeof content === 'string') {
                    textContent = content;
                } else if (content instanceof Blob) {
                    textContent = await content.text();
                } else if (typeof content === 'object' && content !== null && content.isBinary) {
                    textContent = `[Binary file content not displayed: ${item.name}]`;
                } else if (content) {
                    textContent = `[Unsupported content type for ${item.name}]`;
                }

                // --- NEW: Standard Markdown Formatting ---
                const langMap = {
                    '.js': 'javascript', '.mjs': 'javascript', '.css': 'css',
                    '.html': 'html', '.htm': 'html', '.xml': 'xml', '.svg': 'xml',
                    '.json': 'json', '.md': 'markdown', '.py': 'python',
                    '.sh': 'shell', '.java': 'java', '.c': 'c', '.cpp': 'cpp'
                };
                const extension = '.' + (item.name || '').split('.').pop().toLowerCase();
                const langIdentifier = langMap[extension] || ''; // Gets 'javascript', 'css', etc.

                // Build the clean Markdown output for a file
                combinedContent += `### File: \`${item.path || item.name}\`\n\n`;
                combinedContent += '```' + langIdentifier + '\n';
                combinedContent += textContent.trim() + '\n'; // Trim to remove extra whitespace
                combinedContent += '```\n\n';
                combinedContent += '---\n\n'; // A standard horizontal rule separator

            } else if (item.kind === 'directory') {
                // Use a clean Markdown header for the directory path
                combinedContent += `## Directory: \`${item.path || item.name}\`\n\n`;
                
                const children = await FileSystemProvider.list(item);
                children.sort((a, b) => (a.kind === b.kind) ? a.name.localeCompare(b.name) : (a.kind === 'directory' ? -1 : 1));

                for (const child of children) {
                    const workspace = State.workspaces.find(ws => ws.id === (item.workspaceId ?? item.id));
                    if (workspace) {
                        const fullChildItem = { ...workspace, ...child, workspaceId: workspace.id };
                        await processItem(fullChildItem);
                    }
                }
            }
        };

        for (const item of items) {
            await processItem(item);
        }

        if (combinedContent) {
            const success = await Clipboard.write(combinedContent);
            UI.showToast(success ? 'Contents copied as Markdown!' : 'Failed to copy contents.', success ? 'success' : 'error');
        } else {
            UI.showToast('No text content found to copy.', 'info');
        }

    } catch (error) {
        console.error("Error copying all contents:", error);
        UI.showToast(`Error: ${error.message}`, 'error');
    } finally {
        UI.hideLoading();
    }
},
    

	
    // B"H
    async deleteSelected() {
        const selectedPaths = Array.from(State.selectedItems);
        if (selectedPaths.length === 0) { UI.showToast("No items selected to delete.", "info"); return; }
        const itemsToDelete = selectedPaths.map(p => State.domItemMap.get(p)?.item).filter(Boolean);
        if (itemsToDelete.length === 0) return;

        const firstItem = itemsToDelete[0];
        const isDirectGitHub = firstItem.type === 'github';

        // --- NEW DISPATCHER LOGIC ---
        // If we are interacting directly with a GitHub workspace, use the sequential method.
        if (isDirectGitHub) {
            await this.deleteSelectedSequentially(itemsToDelete, 'github');
        } else {
            // Check if the items are inside a cloned folder.
            const parentFolder = { ...firstItem, path: firstItem.path.substring(0, firstItem.path.lastIndexOf('/')) || '/' };
            const gitInfo = await GitMetaProvider.getGitInfoForFolder(parentFolder);

            if (gitInfo) {
                // If inside a clone, use the powerful atomic commit method.
                await this.deleteSelectedGitHubAtomically(itemsToDelete, gitInfo);
            } else {
                // For regular local/indexeddb folders, use the standard concurrent method.
                await this.deleteSelectedStandard(itemsToDelete);
            }
        }
    },

    
    // ADD THIS NEW, SEQUENTIAL DELETE FUNCTION
    async deleteSelectedSequentially(itemsToDelete, typeLabel) {
        const confirmed = await UI.showDialog({
            title: `Confirm ${typeLabel} Deletion`,
            message: `Are you sure you want to permanently delete these ${itemsToDelete.length} item(s)? This will be done one by one.`,
            okText: 'Delete',
            cancelText: 'Cancel'
        });
        if (!confirmed) return;

        UI.showLoading(`Starting deletion...`);
        try {
            for (const item of itemsToDelete) {
                const tab = State.tabs.find(t => t.uniquePath === Tabs.getUniquePath(item));
                if (tab) await Tabs.close(tab.id, true);
            }
            
            // --- THE SEQUENTIAL LOGIC ---
            let count = 0;
            for (const item of itemsToDelete) {
                count++;
                UI.showLoading(`Deleting ${count} of ${itemsToDelete.length}: ${item.name}`);
                try {
                    await FileSystemProvider.delete(item);
                } catch (e) {
                    // Log the error for the specific file but continue with the rest.
                    console.error(`Failed to delete ${item.name}:`, e);
                    UI.showToast(`Failed to delete ${item.name}.`, 'error');
                }
            }
            // --- END SEQUENTIAL LOGIC ---

            
            
            const parentPathsToRefresh = new Set();
            itemsToDelete.forEach(item => {
                const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
                const parentItem = { ...item, path: parentPath, kind: 'directory' };
                parentPathsToRefresh.add(getItemUniquePath(parentItem));
            });

            for (const uniqueParentPath of parentPathsToRefresh) {
                const parentEntry = State.domItemMap.get(uniqueParentPath);
                if (parentEntry) await Workspaces.refreshNode(parentEntry.item);
            }
            

            UI.showToast(`${itemsToDelete.length} item(s) processed for deletion.`, 'success');

        } catch (e) {
            UI.showToast(`Deletion failed: ${e.message}`, 'error');
        } finally {
            SelectionManager.end();
            UI.hideLoading();
        }
    },

    
    
    // B"H
    async pullAndOverwrite(folderToUpdate, gitInfo) {
        const confirmed = await UI.showDialog({
            title: 'Confirm Overwrite',
            message: `This will update your local folder '${folderToUpdate.name}' to match the latest version on GitHub. Local changes will be overwritten. Proceed?`,
            okText: 'Yes, Pull Changes',
            cancelText: 'Cancel'
        });
        if (!confirmed) return;

        UI.showLoading(`Checking for remote changes...`);
        try {
            // 1. Get the latest state of the remote repository.
            const sourceRepoItem = { type: 'github', ...gitInfo };
            const newTreeData = await FileSystemProvider.GitHub.getFullTree(sourceRepoItem);
            const newFilesMap = new Map(newTreeData.tree.map(f => [f.path, f]));
            const oldFilesMap = new Map(gitInfo.remoteTree.map(f => [f.path, f]));

            // 2. Intelligently calculate what needs to be changed.
            const filesToDownload = [];
            const filesToDelete = [];

            // Find files to add or update
            newFilesMap.forEach((newFile, path) => {
                if (!oldFilesMap.has(path) || oldFilesMap.get(path).sha !== newFile.sha) {
                    filesToDownload.push(newFile);
                }
            });

            // Find files to delete
            oldFilesMap.forEach((oldFile, path) => {
                if (!newFilesMap.has(path)) {
                    filesToDelete.push(oldFile);
                }
            });

            const totalChanges = filesToDownload.length + filesToDelete.length;
            if (totalChanges === 0) {
                UI.showToast("Already up-to-date.", 'success');
                UI.hideLoading();
                return;
            }

            UI.showLoading(`Found ${totalChanges} change(s). Preparing to pull...`);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 3. Execute Deletions (if any)
            if (filesToDelete.length > 0) {
                const deletionPromises = filesToDelete.map(file => {
                    const itemToDelete = { ...folderToUpdate, path: `${folderToUpdate.path}/${file.path}` };
                    return FileSystemProvider.delete(itemToDelete);
                });
                await Promise.all(deletionPromises);
            }

            // 4. Execute Downloads (if any)
            for (const fileNode of filesToDownload) {
                UI.showLoading(`Pulling: ${fileNode.path}`);
                const itemForReading = { ...sourceRepoItem, path: fileNode.path, sha: fileNode.sha, name: fileNode.name };
                const content = await FileSystemProvider.GitHub.read(itemForReading);
                const destinationItem = { ...folderToUpdate, path: `${folderToUpdate.path}/${fileNode.path}` };
                const parentPath = fileNode.path.substring(0, fileNode.path.lastIndexOf('/'));
                if (parentPath) {
                    await this._ensurePathExists(folderToUpdate, parentPath);
                }
                await FileSystemProvider.write(destinationItem, content);
            }

            // 5. Update the local metadata in ikar.js to the new state.
            const updatedGitInfo = { ...gitInfo, baseCommitSHA: newTreeData.sha, remoteTree: newTreeData.tree };
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
