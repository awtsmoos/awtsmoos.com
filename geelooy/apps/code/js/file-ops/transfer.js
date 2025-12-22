// B"H
// FILE: js/file-ops/transfer.js
import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Clipboard } from '../clipboard.js';
import { SelectionManager } from '../selection-manager.js';
import { Workspaces, getItemUniquePath } from '../workspaces.js';
import { Tabs } from '../tabs/index.js';
import { GitMetaProvider } from '../git/meta.js'; // B"H - Updated Import
import { Exporter } from './exporter.js';
import { calculateGitBlobSha } from '../git-sha-calculator.js';

export const Transfer = {
    async copySelected() {
        const selectedPaths = Array.from(State.selectedItems);
        if (selectedPaths.length === 0) {
            UI.showToast("No items selected.", "info");
            return;
        }
        State.fileClipboard = selectedPaths;
        State.clipboardZip = null;
        UI.showToast(`${selectedPaths.length} item(s) copied to clipboard.`, 'success');
        SelectionManager.end();
    },

    async copyAllContents(items) {
        if (!items || items.length === 0) {
            UI.showToast("Nothing selected to copy.", "info");
            return;
        }

        const taskId = `copy-contents-${Date.now()}`;
        UI.startTask(taskId, "Preparing markdown...");
        
        let combinedContent = 'B"H\n\n'; 
        let processedCount = 0;

        try {
            const processItem = async (item) => {
                if (!item || !item.kind) return;

                // Update UI periodically
                processedCount++;
                if (processedCount % 5 === 0) {
                    UI.updateTask(taskId, 50, `Reading: ${item.name}`);
                }

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

                    combinedContent += `### File: \`${item.path || item.name}\`\n\n`;
                    combinedContent += '```\n';
                    combinedContent += textContent.trim() + '\n'; 
                    combinedContent += '```\n\n';
                    combinedContent += '---\n\n'; 

                } else if (item.kind === 'directory') {
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

            UI.updateTask(taskId, 90, "Writing to clipboard...");

            if (combinedContent) {
                const filename = items.length === 1 ? `${items[0].name}.txt` : `Selection_Export.txt`;
                const fakeFile = new File([combinedContent], filename, { type: "text/plain" });
                const success = await Clipboard.write(fakeFile);
                if (success) {
                    UI.endTask(taskId, 'success', 'Copied content to clipboard!');
                } else {
                    UI.endTask(taskId, 'error', 'Clipboard write failed.');
                }
            } else {
                UI.endTask(taskId, 'info', 'No text content found.');
            }

        } catch (error) {
            console.error("Error copying all contents:", error);
            UI.endTask(taskId, 'error', `Error: ${error.message}`);
        }
    },

    async deleteSelected() {
        const selectedPaths = Array.from(State.selectedItems);
        if (selectedPaths.length === 0) { UI.showToast("No items selected to delete.", "info"); return; }
        const itemsToDelete = selectedPaths.map(p => State.domItemMap.get(p)?.item).filter(Boolean);
        if (itemsToDelete.length === 0) return;

        const firstItem = itemsToDelete[0];
        const isDirectGitHub = firstItem.type === 'github';

        if (isDirectGitHub) {
            await this.deleteSelectedSequentially(itemsToDelete, 'github');
        } else {
            const parentFolder = { ...firstItem, path: firstItem.path.substring(0, firstItem.path.lastIndexOf('/')) || '/' };
            const gitInfo = await GitMetaProvider.getGitInfoForFolder(parentFolder);

            if (gitInfo) {
                await this.deleteSelectedStandard(itemsToDelete); 
            } else {
                await this.deleteSelectedStandard(itemsToDelete);
            }
        }
    },

    async deleteSelectedSequentially(itemsToDelete, typeLabel) {
        const confirmed = await UI.showDialog({
            title: `Confirm ${typeLabel} Deletion`,
            message: `Are you sure you want to permanently delete these ${itemsToDelete.length} item(s)? This will be done one by one.`,
            okText: 'Delete',
            cancelText: 'Cancel'
        });
        if (!confirmed) return;

        const taskId = `delete-${Date.now()}`;
        UI.startTask(taskId, `Deleting ${itemsToDelete.length} items...`);

        try {
            for (const item of itemsToDelete) {
                const tab = State.tabs.find(t => t.uniquePath === Tabs.getUniquePath(item));
                if (tab) await Tabs.close(tab.id, true);
            }
            
            let count = 0;
            for (const item of itemsToDelete) {
                count++;
                const pct = (count / itemsToDelete.length) * 100;
                UI.updateTask(taskId, pct, `Deleting: ${item.name}`);
                
                try {
                    await FileSystemProvider.delete(item);
                } catch (e) {
                    console.error(`Failed to delete ${item.name}:`, e);
                    UI.showToast(`Failed to delete ${item.name}.`, 'error');
                }
            }
            await this._refreshParents(itemsToDelete);
            UI.endTask(taskId, 'success', `Deleted ${itemsToDelete.length} items.`);

        } catch (e) {
            UI.endTask(taskId, 'error', `Deletion failed: ${e.message}`);
        } finally {
            SelectionManager.end();
        }
    },

    async deleteSelectedStandard(itemsToDelete) {
        const confirmed = await UI.showDialog({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete these ${itemsToDelete.length} item(s)?`,
            okText: 'Delete',
            cancelText: 'Cancel'
        });
        if (!confirmed) return;

        const taskId = `delete-${Date.now()}`;
        UI.startTask(taskId, "Deleting items...");

        try {
            let count = 0;
            for (const item of itemsToDelete) {
                count++;
                const pct = (count / itemsToDelete.length) * 100;
                UI.updateTask(taskId, pct, `Deleting ${item.name}...`);

                const tab = State.tabs.find(t => t.uniquePath === Tabs.getUniquePath(item));
                if (tab) await Tabs.close(tab.id, true);
                await FileSystemProvider.delete(item);
            }
            await this._refreshParents(itemsToDelete);
            UI.endTask(taskId, 'success', `Deleted ${itemsToDelete.length} items.`);
        } catch (e) {
            UI.endTask(taskId, 'error', `Deletion failed: ${e.message}`);
        } finally {
            SelectionManager.end();
        }
    },

    async _refreshParents(items) {
        const parentPathsToRefresh = new Set();
        items.forEach(item => {
            const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
            const parentItem = { ...item, path: parentPath, kind: 'directory' };
            parentPathsToRefresh.add(getItemUniquePath(parentItem));
        });

        for (const uniqueParentPath of parentPathsToRefresh) {
            const parentEntry = State.domItemMap.get(uniqueParentPath);
            if (parentEntry) await Workspaces.refreshNode(parentEntry.item);
        }
    },

    async paste(destinationDir) {
        if (State.clipboardZip) {
            let blob;
            let name = State.clipboardZip.name;

            const taskId = `paste-zip-${Date.now()}`;
            UI.startTask(taskId, "Preparing ZIP...");

            // B"H - Handle Lazy Zip
            if (State.clipboardZip.type === 'lazy-zip') {
                UI.updateTask(taskId, 20, "Compressing items...");
                try {
                    // Actual Zipping happens here, triggered by paste
                    blob = await Exporter.createZipBlob(State.clipboardZip.items);
                } catch(e) {
                    UI.endTask(taskId, 'error', "Compression failed: " + e.message);
                    return;
                }
            } else {
                blob = State.clipboardZip.blob;
            }

            const newItem = { ...destinationDir, name, kind: 'file', path: destinationDir.path === '/' ? `/${name}` : `${destinationDir.path}/${name}` };
            
            UI.updateTask(taskId, 70, "Writing ZIP to disk...");
            try {
                const arrayBuffer = await blob.arrayBuffer();
                await FileSystemProvider.write(newItem, arrayBuffer);
                UI.endTask(taskId, 'success', "Pasted ZIP archive.");
            } catch(e) {
                UI.endTask(taskId, 'error', "Failed to write ZIP: " + e.message);
            } finally {
                await Workspaces.refreshNode(destinationDir);
            }
            return;
        }

        if (!State.fileClipboard || State.fileClipboard.length === 0) {
            UI.showToast("Clipboard is empty.", "warning");
            return;
        }

        const sourceItemUniquePath = State.fileClipboard[0];
        const sourceItem = State.domItemMap.get(sourceItemUniquePath)?.item;

        // B"H - CLONE REPO LOGIC
        // If the source is a GitHub Repo Root, we treat this paste as a "Clone" operation.
        if (State.fileClipboard.length === 1 && sourceItem && sourceItem.type === 'github' && sourceItem.path === '/') {
            await this.cloneRepoToFolder(sourceItem, destinationDir);
        } else {
            await this.standardPaste(destinationDir);
        }
    },

    // B"H - New Method: Clones a GitHub workspace into a target folder
    async cloneRepoToFolder(sourceRepoItem, destinationDir) {
        const repoName = sourceRepoItem.name.split('/').pop() || 'repo';
        
        const confirmed = await UI.showDialog({
            title: "Clone Repository",
            message: `Clone '${sourceRepoItem.name}' into '${destinationDir.name}'?`,
            okText: "Clone",
            cancelText: "Cancel"
        });
        
        if (!confirmed) return;

        const taskId = `clone-${Date.now()}`;
        UI.startTask(taskId, `Cloning ${repoName}...`);
        
        try {
            // 1. Create target folder
            await FileSystemProvider.create(destinationDir, repoName, 'directory');
            const newRepoRoot = {
                ...destinationDir,
                path: destinationDir.path === '/' ? `/${repoName}` : `${destinationDir.path}/${repoName}`,
                kind: 'directory'
            };

            // 2. Fetch Remote Tree
            UI.updateTask(taskId, 5, "Fetching file tree...");
            const treeData = await FileSystemProvider.GitHub.getFullTree(sourceRepoItem);
            
            // 3. Download Files
            const files = treeData.tree.filter(n => n.type === 'blob');
            let count = 0;
            
            for (const file of files) {
                count++;
                const pct = Math.round((count / files.length) * 100);
                if (count % 2 === 0) UI.updateTask(taskId, pct, `Downloading: ${file.path}`);
                
                const content = await FileSystemProvider.GitHub.read({
                    ...sourceRepoItem,
                    path: file.path,
                    sha: file.sha
                });
                
                const targetPath = `${newRepoRoot.path}/${file.path}`;
                await FileSystemProvider.write({ ...newRepoRoot, path: targetPath }, content);
            }

            // 4. Create Metadata (ikar.js)
            UI.updateTask(taskId, 99, "Finalizing metadata...");
            const gitInfo = {
                isClone: true,
                repoInfo: sourceRepoItem.repoInfo,
                branch: sourceRepoItem.branch,
                baseCommitSHA: treeData.sha,
                remoteTree: treeData.tree
            };
            
            const ikarContent = `// B"H\n\nconst ikar = ${JSON.stringify(gitInfo, null, 4)};`;
            
            // Ensure .awtsmoos-repo exists (might not be in tree)
            await FileSystemProvider.create(newRepoRoot, '.awtsmoos-repo', 'directory');
            const metaDir = { ...newRepoRoot, path: `${newRepoRoot.path}/.awtsmoos-repo` };
            await FileSystemProvider.write({ ...metaDir, path: `${metaDir.path}/ikar.js` }, ikarContent);

            UI.endTask(taskId, 'success', `Cloned ${repoName} successfully!`);
            await Workspaces.refreshNode(destinationDir);

        } catch(e) {
            console.error("Clone Failed:", e);
            UI.endTask(taskId, 'error', "Clone Failed: " + e.message);
        }
    },

    async standardPaste(destinationDir) {
        const taskId = `paste-${Date.now()}`;
        UI.startTask(taskId, "Pasting items...");

        try {
            const itemsToPaste = State.fileClipboard
                .map(uniquePath => State.domItemMap.get(uniquePath)?.item)
                .filter(Boolean);
                
            if (itemsToPaste.length === 0) throw new Error("Source items could not be found.");
            
            let pastedCount = 0;
            for (const sourceItem of itemsToPaste) {
                if (sourceItem.workspaceId === destinationDir.workspaceId && sourceItem.kind === 'directory' && (destinationDir.path === sourceItem.path || destinationDir.path.startsWith(`${sourceItem.path}/`))) {
                    throw new Error(`Cannot paste '${sourceItem.name}' into itself.`);
                }
                
                // Recursively copy with progress updates
                await this._copyRecursive(sourceItem, destinationDir, (name) => {
                    UI.updateTask(taskId, 50, `Copying: ${name}`); // Indeterminate % for deep copies
                });
                pastedCount++;
            }
            UI.endTask(taskId, 'success', `Pasted ${pastedCount} item(s)!`);
        } catch (e) {
            UI.endTask(taskId, 'error', `Paste Failed: ${e.message}`);
        } finally {
            await Workspaces.refreshNode(destinationDir);
        }
    },

    async _copyRecursive(sourceItem, destinationDir, onProgress) {
        if (onProgress) onProgress(sourceItem.name);

        if (sourceItem.kind === 'file') {
            const fileContent = await FileSystemProvider.read(sourceItem);
            const newPath = destinationDir.path === '/' ? sourceItem.name : `${destinationDir.path}/${sourceItem.name}`;
            await FileSystemProvider.write({ ...destinationDir, name: sourceItem.name, path: newPath }, fileContent);
        } else {
            // Directory
            await FileSystemProvider.create(destinationDir, sourceItem.name, 'directory');
            const newDirItem = { 
                ...destinationDir, 
                name: sourceItem.name, 
                path: destinationDir.path === '/' ? sourceItem.name : `${destinationDir.path}/${sourceItem.name}`,
                kind: 'directory' 
            };
            const children = await FileSystemProvider.list(sourceItem);
            for (const child of children) {
                await this._copyRecursive({ ...sourceItem, ...child }, newDirItem, onProgress);
            }
        }
    },
    
    async pullAndOverwrite(folderToUpdate, gitInfo) {
        const confirmed = await UI.showDialog({
            title: 'Confirm Overwrite',
            message: `Update '${folderToUpdate.name}' from GitHub? This will fetch new changes and overwrite conflicted files.`,
            okText: 'Pull',
            cancelText: 'Cancel'
        });
        if (!confirmed) return;

        const taskId = `pull-${Date.now()}`;
        UI.startTask(taskId, `Connecting to GitHub...`);

        try {
            const sourceRepoItem = { type: 'github', workspaceId: folderToUpdate.workspaceId, ...gitInfo };
            const newTreeData = await FileSystemProvider.GitHub.getFullTree(sourceRepoItem);
            const newFiles = newTreeData.tree;
            
            const normalize = p => p.startsWith('/') ? p.slice(1) : p;
            const oldFilesMap = new Map((gitInfo.remoteTree || []).filter(f => f.type === 'blob').map(f => [normalize(f.path), f]));
            
            const filesToDownload = [];
            const filesToDelete = [];
            const newFilesMap = new Set();

            let skippedCount = 0;

            // Phase 1: Calc Diff (Fast)
            UI.updateTask(taskId, 10, "Calculating diff...");
            for (const fileNode of newFiles) {
                if (fileNode.type !== 'blob') continue;
                
                const normPath = normalize(fileNode.path);
                newFilesMap.add(normPath);

                const oldNode = oldFilesMap.get(normPath);
                
                if (!oldNode || oldNode.sha !== fileNode.sha) {
                    try {
                        const localPath = folderToUpdate.path === '/' ? `/${normPath}` : `${folderToUpdate.path}/${normPath}`;
                        const localItem = { ...folderToUpdate, path: localPath, kind: 'file' };
                        const content = await FileSystemProvider.read(localItem);
                        
                        let bytes;
                        if (content instanceof Blob) bytes = new Uint8Array(await content.arrayBuffer());
                        else if (typeof content === 'string') bytes = new TextEncoder().encode(content);
                        else if (content && content.base64Content) bytes = Uint8Array.from(atob(content.base64Content), c => c.charCodeAt(0));
                        else bytes = new Uint8Array(0);

                        const localSha = await calculateGitBlobSha(bytes);
                        
                        if (localSha === fileNode.sha) {
                            skippedCount++;
                            continue; 
                        }
                    } catch (readErr) {}

                    filesToDownload.push(fileNode);
                }
            }

            for (const [path, oldNode] of oldFilesMap) {
                if (!newFilesMap.has(path)) {
                    filesToDelete.push(oldNode);
                }
            }

            if (filesToDownload.length === 0 && filesToDelete.length === 0) {
                if (gitInfo.baseCommitSHA === newTreeData.sha && skippedCount === 0) {
                    UI.endTask(taskId, 'success', "Already up to date.");
                    return;
                }
            }

            if (filesToDelete.length > 0) {
                UI.updateTask(taskId, 20, `Removing ${filesToDelete.length} obsolete files...`);
                for (const file of filesToDelete) {
                    const normPath = normalize(file.path);
                    const fullPath = folderToUpdate.path === '/' ? `/${normPath}` : `${folderToUpdate.path}/${normPath}`;
                    await FileSystemProvider.delete({ ...folderToUpdate, path: fullPath, kind: 'file' });
                }
            }

            let processed = 0;
            for (const fileNode of filesToDownload) {
                processed++;
                const percentage = Math.round((processed / filesToDownload.length) * 100);
                UI.updateTask(taskId, percentage, `Downloading: ${fileNode.path}`);
                
                const content = await FileSystemProvider.GitHub.read({ ...sourceRepoItem, path: fileNode.path, sha: fileNode.sha, name: 'file' });
                const normPath = normalize(fileNode.path);
                const destPath = folderToUpdate.path === '/' ? `/${normPath}` : `${folderToUpdate.path}/${normPath}`;
                await FileSystemProvider.write({ ...folderToUpdate, path: destPath }, content);
            }

            const updatedGitInfo = { ...gitInfo, baseCommitSHA: newTreeData.sha, remoteTree: newTreeData.tree };
            const ikarContent = `// B"H\n\nconst ikar = ${JSON.stringify(updatedGitInfo, null, 4)};`;
            await FileSystemProvider.write({ ...folderToUpdate, path: `${folderToUpdate.path}/.awtsmoos-repo/ikar.js` }, ikarContent);

            await Workspaces.refreshNode(folderToUpdate);
            
            let msg = `Pull complete.`;
            if (filesToDownload.length > 0) msg += ` Updated ${filesToDownload.length} files.`;
            if (skippedCount > 0) msg += ` (Skipped ${skippedCount} identical files).`;
            
            UI.endTask(taskId, 'success', msg);
        } catch (e) {
            UI.endTask(taskId, 'error', `Pull Failed: ${e.message}`);
            console.error(e);
        }
    }
};