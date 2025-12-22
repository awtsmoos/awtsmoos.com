// B"H
// FILE: js/actions/files.js
import { State } from '../state.js';
import { UI } from '../ui.js';
import { Tabs } from '../tabs/index.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from '../workspaces.js';
import { Clipboard } from '../clipboard.js';
import { FileOperations } from '../file-operations.js';
import { ZipExplorer } from '../zip/zip-explorer.js';
import { FileCommander } from '../file-commander.js';
import { App } from '../app.js';

export const FileActions = {
    newTempFile() { Tabs.createTemporary(); },
    openLocalFile() { App.openLocalFile(); },
    save() { Tabs.saveActive(); },
    download() { Tabs.downloadActive(); },
    
    async newItem(item, action) {
        if (item) {
            if (item.type === 'zip-entry') {
                await ZipExplorer.createItem(action === "new-folder" ? "directory" : "file");
                return;
            }
            const kind = action === "new-folder" ? "directory" : "file";
            const name = await UI.showDialog({
                title: `Create New ${kind}`,
                hasInput: true,
                placeholder: `Enter ${kind} name...`
            });
            if (name) {
                await FileSystemProvider.create(item, name, kind);
                UI.showToast(`${kind} '${name}' created.`, "success");
                await Workspaces.refreshNode(item);
                if (kind === "file") {
                    const newPath = item.path === "/" ? `/${name}` : `${item.path}/${name}`;
                    const newFileItem = { ...item, name, path: newPath, kind: "file", content: "" };
                    Tabs.create(newFileItem);
                }
            }
        } else {
            if (action === 'new-file') Tabs.createTemporary();
            else UI.showToast("Select a folder to create a new folder.", "warning");
        }
    },

    async rename(item) {
        if (item && (item.type === 'local' || item.type === 'opfs')) {
            const newName = await UI.showDialog({
                title: "Rename Item",
                hasInput: true,
                inputType: 'text',
                placeholder: item.name,
                inputValue: item.name, 
                okText: "Rename"
            });
            
            if (newName && newName !== item.name) {
                const taskId = `rename-${Date.now()}`;
                UI.startTask(taskId, "Renaming...");
                await FileSystemProvider.rename(item, newName);
                const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
                const parentItem = { ...item, path: parentPath, kind: 'directory' };
                await Workspaces.refreshNode(parentItem);
                UI.endTask(taskId, 'success', "Item renamed.");
            }
        } else {
            UI.showToast("Rename not supported for this item type.", "warning");
        }
    },

    openFileCommander(item) {
        if (item && item.kind === 'directory') FileCommander.show(item);
    },

    openZipEntry(item) {
        if (item && item.type === 'zip-entry' && ZipExplorer.currentZip) {
            const entry = ZipExplorer.currentZip.entries.find(e => e.filename === item.path);
            if (entry) ZipExplorer.openEntry(entry);
            else ZipExplorer.openEntry({ filename: item.path, isDir: false, getData: async() => new Blob([]) });
        }
    },

    copyRelativePath(item) {
        if (item && item.path) {
            Clipboard.write(item.path);
            UI.showToast("Copied relative path.", "success");
        }
    },

    async calculateHash(item) {
        if (item && item.kind === 'file') {
            const taskId = `hash-${Date.now()}`;
            UI.startTask(taskId, "Calculating SHA-256...");
            try {
                const content = await FileSystemProvider.read(item);
                let bytes;
                if (content instanceof Blob) bytes = await content.arrayBuffer();
                else if (typeof content === 'string') bytes = new TextEncoder().encode(content);
                else if (content.base64Content) bytes = Uint8Array.from(atob(content.base64Content), c=>c.charCodeAt(0));
                
                const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                
                UI.endTask(taskId, 'success', 'Hash calculated');
                
                UI.showDialog({
                    title: "SHA-256 Hash",
                    contentHTML: `<div style="word-break:break-all; font-family:monospace; background:var(--color-bg-tertiary); padding:10px; border-radius:4px;">${hashHex}</div>`,
                    okText: "Copy",
                    cancelText: "Close"
                }).then(res => { if(res) Clipboard.write(hashHex); });
            } catch(e) {
                UI.endTask(taskId, 'error', "Error calculating hash");
                UI.showToast("Error calculating hash.", "error");
            }
        }
    },

    async deleteItem(item) {
        if (item) {
            if (item.type === 'zip-entry') {
                await ZipExplorer.deleteItem(item.path);
                return;
            }
            const confirmed = await UI.showDialog({
                title: "Confirm Deletion",
                message: `Delete '${item.name}'?`,
                okText: "Delete"
            });
            if (confirmed) {
                const taskId = `delete-${Date.now()}`;
                UI.startTask(taskId, "Deleting item...");
                
                const tab = State.tabs.find(t => t.uniquePath === Tabs.getUniquePath(item));
                if (tab) await Tabs.close(tab.id, true);
                
                await FileSystemProvider.delete(item);
                
                const parentPath = item.path.substring(0, item.path.lastIndexOf("/")) || "/";
                await Workspaces.refreshNode({ ...item, path: parentPath, kind: "directory" });
                
                UI.endTask(taskId, 'success', `'${item.name}' deleted.`);
            }
        }
    }
};