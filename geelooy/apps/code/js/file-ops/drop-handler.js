// B"H
// FILE: js/file-ops/drop-handler.js
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from '../workspaces.js';

export const DropHandler = {
    async handle(e, targetDir) {
        const items = [...e.dataTransfer.items];
        const entries = items.map(item => item.webkitGetAsEntry ? item.webkitGetAsEntry() : null).filter(Boolean);

        if (entries.length === 0) return;

        const taskId = `drop-${Date.now()}`;
        UI.startTask(taskId, "Analyzing dropped items...");

        try {
            const state = { 
                overwriteAll: false,
                mergeAll: false,
                processedCount: 0,
                taskId: taskId
            };
            
            for (const entry of entries) {
                await this._processDroppedEntry(entry, targetDir, state);
            }
            UI.endTask(taskId, 'success', `Drop complete! Processed ${state.processedCount} items.`);
        } catch (err) {
            if (err.message !== 'Cancelled') {
                UI.endTask(taskId, 'error', "Error during drop: " + err.message);
                console.error(err);
            } else {
                UI.endTask(taskId, 'info', "Drop cancelled.");
            }
        } finally {
            Workspaces.refreshNode(targetDir);
        }
    },

    async _processDroppedEntry(entry, parentDir, state) {
        state.processedCount++;
        if (entry.isDirectory || state.processedCount % 5 === 0) {
            UI.updateTask(state.taskId, 50, `Importing: ${entry.name}`);
        }

        if (entry.isFile) {
            const exists = await this._checkExists(parentDir, entry.name, 'file');
            if (exists && !state.overwriteAll) {
                const choice = await UI.showDialog({
                    title: "File Conflict",
                    message: `File '${entry.name}' already exists in '${parentDir.name}'.`,
                    okText: "Overwrite",
                    secondaryOk: { text: "Overwrite All", actionKey: "all" },
                    cancelText: "Skip"
                });

                if (choice === 'all') state.overwriteAll = true;
                else if (choice === true) { /* Proceed */ }
                else return; 
            }

            const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
            let content;
            if (parentDir.type === 'github') {
                content = await file.text();
            } else {
                content = await file.arrayBuffer();
            }

            const pathPrefix = parentDir.path === '/' ? '' : parentDir.path;
            const itemToWrite = { 
                ...parentDir, 
                path: `${pathPrefix}/${entry.name}`, 
                kind: 'file' 
            };
            await FileSystemProvider.write(itemToWrite, content);

        } else if (entry.isDirectory) {
            const exists = await this._checkExists(parentDir, entry.name, 'directory');
            
            if (exists && !state.mergeAll && !state.overwriteAll) {
                 const choice = await UI.showDialog({
                     title: "Folder Conflict",
                     message: `Folder '${entry.name}' already exists. Merge contents?`,
                     okText: "Merge",
                     secondaryOk: { text: "Merge All", actionKey: "merge_all" },
                     cancelText: "Cancel"
                 });
                 
                 if (choice === 'merge_all') state.mergeAll = true;
                 else if (!choice) throw new Error("Cancelled");
            }

            if (!exists) {
                await FileSystemProvider.create(parentDir, entry.name, 'directory');
            }

            const pathPrefix = parentDir.path === '/' ? '' : parentDir.path;
            const newParent = { 
                ...parentDir, 
                path: `${pathPrefix}/${entry.name}`, 
                kind: 'directory' 
            };

            const dirReader = entry.createReader();
            const readEntries = async () => {
                return new Promise((res, rej) => { dirReader.readEntries(res, rej); });
            };

            let childEntries = [];
            let batch = await readEntries();
            // webkitFileSystem readEntries returns batches, need to loop until empty
            while(batch.length > 0) {
                childEntries = childEntries.concat(batch);
                batch = await readEntries();
            }

            for(const child of childEntries) {
                await this._processDroppedEntry(child, newParent, state);
            }
        }
    },

    async _checkExists(parentDir, name, kind) {
        try {
            const children = await FileSystemProvider.list(parentDir);
            return children.some(c => c.name === name && c.kind === kind);
        } catch (e) {
            return false;
        }
    }
};