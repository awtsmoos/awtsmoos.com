// B"H
// FILE: js/file-ops/transfer.js
import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Clipboard } from '../clipboard.js';
import { SelectionManager } from '../selection-manager.js';
import { Workspaces, getItemUniquePath } from '../workspaces.js';
import { Tabs } from '../tabs/index.js';
import { Exporter } from './exporter.js';

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

                processedCount++;
                UI.updateTask(taskId, 50, `Reading: ${item.name}`);

                if (item.kind === 'file') {
                    const content = await FileSystemProvider.read(item);
                    let textContent = '';

                    if (typeof content === 'string') {
                        textContent = content;
                    } else if (content instanceof Blob) {
                        textContent = await content.text();
                    } else if (typeof content === 'object' && content !== null && content.isBinary) {
                        textContent = `[Binary file content not displayed: ${item.name}]`;
                    }

                    combinedContent += `### File: \`${item.path || item.name}\`\n\n`;
                    combinedContent += '```\n';
                    combinedContent += textContent.trim() + '\n'; 
                    combinedContent += '```\n\n';
                    combinedContent += '---\n\n'; 

                } else if (item.kind === 'directory') {
                    combinedContent += `## Directory: \`${item.path || item.name}\`\n\n`;
                    const children = await FileSystemProvider.list(item);
                    for (const child of children) {
                        const workspace = State.workspaces.find(ws => ws.id === (item.workspaceId ?? item.id));
                        if (workspace) {
                            await processItem({ ...workspace, ...child, workspaceId: workspace.id });
                        }
                    }
                }
            };

            for (const item of items) {
                await processItem(item);
            }

            UI.updateTask(taskId, 90, "Finalizing...");
            const fakeFile = new File([combinedContent], "Selection_Export.txt", { type: "text/plain" });
            const success = await Clipboard.write(fakeFile);
            if (success) UI.endTask(taskId, 'success', 'Copied content to clipboard!');
            else UI.endTask(taskId, 'error', 'Clipboard write failed.');

        } catch (error) {
            UI.endTask(taskId, 'error', `Error: ${error.message}`);
        }
    },

    async deleteSelected() {
        const selectedPaths = Array.from(State.selectedItems);
        if (selectedPaths.length === 0) return;
        const itemsToDelete = selectedPaths.map(p => State.domItemMap.get(p)?.item).filter(Boolean);
        if (itemsToDelete.length === 0) return;

        await this.deleteSelectedSequentially(itemsToDelete, 'Standard');
    },

    async deleteSelectedSequentially(itemsToDelete, typeLabel) {
        const confirmed = await UI.showDialog({
            title: `Confirm Deletion`,
            message: `Delete ${itemsToDelete.length} item(s)?`,
            okText: 'Delete'
        });
        if (!confirmed) return;

        const taskId = `delete-${Date.now()}`;
        UI.startTask(taskId, `Deleting...`);

        try {
            let count = 0;
            for (const item of itemsToDelete) {
                count++;
                UI.updateTask(taskId, (count / itemsToDelete.length) * 100, `Deleting: ${item.name}`);
                const tab = State.tabs.find(t => t.uniquePath === Tabs.getUniquePath(item));
                if (tab) await Tabs.close(tab.id, true);
                await FileSystemProvider.delete(item);
            }
            await this._refreshParents(itemsToDelete);
            UI.endTask(taskId, 'success', `Deleted ${itemsToDelete.length} items.`);
        } catch (e) {
            UI.endTask(taskId, 'error', `Failed: ${e.message}`);
        } finally {
            SelectionManager.end();
        }
    },

    async _refreshParents(items) {
        const parentPaths = new Set();
        items.forEach(item => {
            const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
            parentPaths.add(`${item.workspaceId}::${parentPath}`);
        });
        for (const up of parentPaths) {
            const entry = State.domItemMap.get(up);
            if (entry) await Workspaces.refreshNode(entry.item);
        }
    },

    async paste(destinationDir) {
        if (State.clipboardZip) {
            const taskId = `paste-zip-${Date.now()}`;
            UI.startTask(taskId, "Pasting ZIP...");
            try {
                const blob = State.clipboardZip.type === 'lazy-zip' 
                    ? await Exporter.createZipBlob(State.clipboardZip.items)
                    : State.clipboardZip.blob;
                
                const newItem = { ...destinationDir, name: State.clipboardZip.name, kind: 'file', path: `${destinationDir.path === '/' ? '' : destinationDir.path}/${State.clipboardZip.name}` };
                await FileSystemProvider.write(newItem, await blob.arrayBuffer());
                UI.endTask(taskId, 'success', "Pasted ZIP.");
            } catch(e) {
                UI.endTask(taskId, 'error', "Paste failed.");
            } finally {
                await Workspaces.refreshNode(destinationDir);
            }
            return;
        }

        if (!State.fileClipboard || State.fileClipboard.length === 0) {
            UI.showToast("Clipboard is empty.", "warning");
            return;
        }

        const taskId = `paste-${Date.now()}`;
        UI.startTask(taskId, "Scanning source items...");
        
        try {
            const sourceItems = State.fileClipboard.map(p => State.domItemMap.get(p)?.item).filter(Boolean);
            
            // B"H - Pre-scan to count files for progress bar
            let totalFiles = 0;
            const countRecursive = async (item) => {
                totalFiles++;
                if (item.kind === 'directory') {
                    const children = await FileSystemProvider.list(item);
                    for (const child of children) await countRecursive({ ...item, ...child });
                }
            };
            for (const item of sourceItems) await countRecursive(item);

            let copiedCount = 0;
            const onFile = (name) => {
                copiedCount++;
                UI.updateTask(taskId, (copiedCount / totalFiles) * 100, `Copying (${copiedCount}/${totalFiles}): ${name}`);
            };

            for (const source of sourceItems) {
                await this._copyRecursive(source, destinationDir, onFile);
            }
            UI.endTask(taskId, 'success', `Pasted ${totalFiles} items.`);
        } catch(e) {
            UI.endTask(taskId, 'error', "Paste failed: " + e.message);
        } finally {
            await Workspaces.refreshNode(destinationDir);
        }
    },

    async _copyRecursive(source, dest, onProgress) {
        if (onProgress) onProgress(source.name);

        const newPath = dest.path === '/' ? `/${source.name}` : `${dest.path}/${source.name}`;
        const newItem = { ...dest, name: source.name, path: newPath };

        if (source.kind === 'file') {
            const content = await FileSystemProvider.read(source);
            await FileSystemProvider.write(newItem, content);
        } else {
            try { await FileSystemProvider.create(dest, source.name, 'directory'); } catch(e) {}
            const children = await FileSystemProvider.list(source);
            for (const child of children) {
                const workspace = State.workspaces.find(ws => ws.id === (source.workspaceId ?? source.id));
                await this._copyRecursive({ ...workspace, ...child }, { ...newItem, kind: 'directory' }, onProgress);
            }
        }
    }
};