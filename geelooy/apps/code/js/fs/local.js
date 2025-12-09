// B"H
// FILE: js/fs/local.js
import { State } from '../state.js';

export const LocalProvider = {
    // Helper to find the root handle if the item handle is missing
    _getRootHandle(item) {
        if (item.handle) return item.handle; // Use existing if available
        
        // If missing (e.g. after refresh), find the workspace
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        if (!workspace) throw new Error(`Workspace not found for item: ${item.name}`);
        if (!workspace.handle) throw new Error(`Workspace '${workspace.name}' is not connected (Locked or Lost).`);
        
        return workspace.handle;
    },

    async getHandle(rootHandle, path, { kind = 'directory', create = false } = {}) {
        let currentHandle = rootHandle;
        const decodedPath = decodeURIComponent(path).replace(/^\//, '');

        if (!decodedPath) return rootHandle;

        const parts = decodedPath.split('/');
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;

            const isLastPart = i === parts.length - 1;

            if (isLastPart && kind === 'file') {
                currentHandle = await currentHandle.getFileHandle(part, { create });
            } else {
                currentHandle = await currentHandle.getDirectoryHandle(part, { create });
            }
        }
        return currentHandle;
    },

    async list({ handle, path, workspaceId }) {
        // 1. Recover Root Handle if missing
        const root = handle || (State.workspaces.find(w => w.id === workspaceId)?.handle);
        if (!root) throw new Error("No handle available");

        const dirHandle = await this.getHandle(root, path);
        const entries = [];
        
        for await (const entry of dirHandle.values()) {
            let size = 0;
            let lastModified = 0;
            
            if (entry.kind === 'file') {
                try {
                    const file = await entry.getFile();
                    size = file.size;
                    lastModified = file.lastModified;
                } catch(e) { /* ignore perm issues */ }
            }

            entries.push({ 
                handle: root, 
                name: entry.name, 
                kind: entry.kind, 
                path: `${path === '/' ? '' : path}/${entry.name}`,
                workspaceId: workspaceId,
                size: size,
                lastModified: lastModified
            });
        }
        return entries;
    },

    async listAllFiles(item) {
        const root = this._getRootHandle(item);
        const allFiles = [];
        
        // Recursive traverse function
        const traverse = async (dirHandle, currentPath) => {
            for await (const entry of dirHandle.values()) {
                const newPath = `${currentPath}/${entry.name}`;
                if (entry.kind === 'file') {
                    allFiles.push({
                        name: entry.name,
                        kind: 'file',
                        path: newPath,
                        workspaceId: item.workspaceId // Pass ID
                    });
                } else if (entry.kind === 'directory') {
                    await traverse(entry, newPath);
                }
            }
        };
        
        const targetHandle = await this.getHandle(root, item.path);
        await traverse(targetHandle, item.path === '/' ? '' : item.path);
        return allFiles;
    },

    async read(item) {
        const root = this._getRootHandle(item);
        const relativePath = item.path.startsWith('/') ? item.path.substring(1) : item.path;
        const fileHandle = await this.getHandle(root, relativePath, { kind: 'file' });
        // This returns a File object (Blob), which Tabs.activate now correctly handles
        return await fileHandle.getFile(); 
    },

    async write(item, content) {
        // Find workspace to verify connection and get handle
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        if (!workspace) throw new Error(`Critical error: Parent workspace not found.`);
        
        const performSave = async (rootHandle) => {
            const fileHandle = await this.getHandle(rootHandle, item.path, { kind: 'file', create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
        };

        try {
            // Try with the workspace's current handle
            await performSave(workspace.handle);
        } catch (e) {
            // If the handle is stale (e.g., browser security change), try to recover
            if (e.name === 'NotAllowedError' || e.message.includes('state had changed')) {
                console.warn(`Stale handle for "${workspace.name}". Requesting permission/re-select.`);
                
                // If it's just a permission lock, this might fix it?
                // Usually write requires 'readwrite' permission specifically.
                if ((await workspace.handle.queryPermission({mode:'readwrite'})) !== 'granted') {
                    await workspace.handle.requestPermission({mode:'readwrite'});
                    // Retry immediately after permission grant
                    await performSave(workspace.handle);
                    return;
                }
            }
            throw e;
        }
    },

    async create(parentDir, name, kind) {
        const root = this._getRootHandle(parentDir);
        const parentHandle = await this.getHandle(root, parentDir.path, { kind: 'directory' });
        if (kind === 'file') {
            await parentHandle.getFileHandle(name, { create: true });
        } else {
            await parentHandle.getDirectoryHandle(name, { create: true });
        }
    },

    async delete(item) {
        const root = this._getRootHandle(item);
        const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
        const name = item.path.substring(item.path.lastIndexOf('/') + 1);
        const parentHandle = await this.getHandle(root, parentPath);
        await parentHandle.removeEntry(name, { recursive: true });
    },

    async rename(item, newName) {
        const root = this._getRootHandle(item);
        const path = item.path.startsWith('/') ? item.path.substring(1) : item.path;
        
        let handle;
        try {
            handle = await this.getHandle(root, path, { kind: item.kind });
        } catch(e) {
            throw new Error("Could not locate original item.");
        }

        if (handle.move) {
            await handle.move(newName);
        } else {
            throw new Error("Rename is not supported by your browser (Requires File System Access API 'move').");
        }
    }
};