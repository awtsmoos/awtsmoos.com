// B"H
// FILE: js/fs/opfs.js
import { LocalProvider } from './local.js';

export const OPFSProvider = {
    // OPFS reuses much of the Local logic but the root is obtained differently
    ...LocalProvider,

    async _getRootHandle() {
        return await navigator.storage.getDirectory();
    },

    // Override getHandle to use the specialized root fetcher
    async getHandle(rootHandle, path, { kind = 'directory', create = false } = {}) {
        // Use OPFS root if not provided, else use provided root (recursion)
        const root = rootHandle || await this._getRootHandle();
        
        // Delegate to LocalProvider's logic which handles path splitting
        return LocalProvider.getHandle(root, path, { kind, create });
    },

    // Override list to inject the root if missing
    async list(item) {
        const root = await this._getRootHandle();
        return LocalProvider.list({ ...item, handle: root });
    },

    // Override other methods to ensure root injection
    async read(item) {
        const root = await this._getRootHandle();
        // Since LocalProvider.read calls _getRootHandle internally which relies on workspace state,
        // we must implement specific read logic here using the OPFS root directly.
        const relativePath = item.path.startsWith('/') ? item.path.substring(1) : item.path;
        const fileHandle = await this.getHandle(root, relativePath, { kind: 'file' });
        return await fileHandle.getFile();
    },

    async write(item, content) {
        const root = await this._getRootHandle();
        const relativePath = item.path.startsWith('/') ? item.path.substring(1) : item.path;
        const fileHandle = await this.getHandle(root, relativePath, { kind: 'file', create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    },

    async create(parentDir, name, kind) {
        const root = await this._getRootHandle();
        const parentPath = parentDir.path.startsWith('/') ? parentDir.path.substring(1) : parentDir.path;
        const parentHandle = await this.getHandle(root, parentPath, { kind: 'directory' });
        
        if (kind === 'file') {
            await parentHandle.getFileHandle(name, { create: true });
        } else {
            await parentHandle.getDirectoryHandle(name, { create: true });
        }
    },

    async delete(item) {
        const root = await this._getRootHandle();
        const relativePath = item.path.startsWith('/') ? item.path.substring(1) : item.path;
        const parentPath = relativePath.substring(0, relativePath.lastIndexOf('/'));
        const name = relativePath.substring(relativePath.lastIndexOf('/') + 1);
        
        const parentHandle = await this.getHandle(root, parentPath);
        await parentHandle.removeEntry(name, { recursive: true });
    },
    
    async listAllFiles(item) {
        const root = await this._getRootHandle();
        // Create a temporary item with the correct handle to pass to Local's logic
        const tempItem = { ...item, handle: root };
        // We can't reuse LocalProvider.listAllFiles directly easily because of _getRootHandle dependency on workspace state
        // So we reimplement the traversal
        const allFiles = [];
        
        const traverse = async (dirHandle, currentPath) => {
            for await (const entry of dirHandle.values()) {
                const newPath = `${currentPath}/${entry.name}`;
                if (entry.kind === 'file') {
                    allFiles.push({
                        name: entry.name,
                        kind: 'file',
                        path: newPath,
                        workspaceId: item.workspaceId
                    });
                } else if (entry.kind === 'directory') {
                    await traverse(entry, newPath);
                }
            }
        };
        
        // Determine root dir handle for the item path
        const relativePath = item.path.startsWith('/') ? item.path.substring(1) : item.path;
        const targetHandle = await this.getHandle(root, relativePath);
        
        await traverse(targetHandle, item.path === '/' ? '' : item.path);
        return allFiles;
    }
};