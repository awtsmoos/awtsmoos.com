// B"H
// FILE: js/fs/local.js
import { State } from '../state.js';

export const LocalProvider = {
    _handleCache: new WeakMap(), // rootHandle -> Map(path -> handle)

    _getRootHandle(item) {
        if (item.handle) return item.handle; 
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        if (!workspace) throw new Error(`Workspace not found for item: ${item.name}`);
        if (!workspace.handle) throw new Error(`Workspace '${workspace.name}' is not connected.`);
        return workspace.handle;
    },

    async getHandle(rootHandle, path, { kind = 'directory', create = false } = {}) {
        if (!this._handleCache.has(rootHandle)) {
            this._handleCache.set(rootHandle, new Map());
        }
        const cache = this._handleCache.get(rootHandle);
        const cacheKey = `${kind}:${path}`;

        // B"H - Aggressive Caching
        // Even if create is true, if we have a valid handle in cache, assume it's good.
        // This avoids traversing the directory tree on every save.
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        let currentHandle = rootHandle;
        const decodedPath = decodeURIComponent(path).replace(/^\//, '');

        if (!decodedPath) return rootHandle;

        const parts = decodedPath.split('/');
        
        // B"H - Optimization: Try to find a partial path in the cache
        let startIdx = 0;
        for (let i = parts.length - 1; i >= 0; i--) {
             const partialPath = parts.slice(0, i + 1).join('/');
             const partialKey = `directory:${partialPath}`;
             if (cache.has(partialKey)) {
                 currentHandle = cache.get(partialKey);
                 startIdx = i + 1;
                 break;
             }
        }

        for (let i = startIdx; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;
            const isLastPart = i === parts.length - 1;
            if (!isLastPart) {
                currentHandle = await currentHandle.getDirectoryHandle(part, { create });
                // Cache intermediate directory handles
                cache.set(`directory:${parts.slice(0, i+1).join('/')}`, currentHandle);
            } else {
                if (kind === 'file') {
                    currentHandle = await currentHandle.getFileHandle(part, { create });
                } else {
                    currentHandle = await currentHandle.getDirectoryHandle(part, { create });
                }
            }
        }
        
        // Cache the final handle
        cache.set(cacheKey, currentHandle);
        return currentHandle;
    },

    async list({ handle, path, workspaceId }) {
        const root = handle || (State.workspaces.find(w => w.id === workspaceId)?.handle);
        if (!root) throw new Error("No handle available");
        const dirHandle = await this.getHandle(root, path);
        const entries = [];
        for await (const entry of dirHandle.values()) {
            let size = 0; let lastModified = 0;
            if (entry.kind === 'file') {
                try {
                    const file = await entry.getFile();
                    size = file.size; lastModified = file.lastModified;
                } catch(e) { }
            }
            entries.push({ 
                handle: root, name: entry.name, kind: entry.kind, 
                path: `${path === '/' ? '' : path}/${entry.name}`,
                workspaceId: workspaceId, size, lastModified
            });
        }
        return entries;
    },

    async listAllFiles(item) {
        const root = this._getRootHandle(item);
        const allFiles = [];
        const traverse = async (dirHandle, currentPath) => {
            for await (const entry of dirHandle.values()) {
                const newPath = `${currentPath}/${entry.name}`;
                if (entry.kind === 'file') {
                    allFiles.push({ name: entry.name, kind: 'file', path: newPath, workspaceId: item.workspaceId });
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
        return await fileHandle.getFile(); 
    },

    async write(item, content) {
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        if (!workspace) throw new Error(`Workspace not found.`);
        
        const performSave = async (rootHandle) => {
            const relativePath = item.path.startsWith('/') ? item.path.substring(1) : item.path;
            
            // Try to get existing handle using aggressive cache first
            let fileHandle;
            try {
                fileHandle = await this.getHandle(rootHandle, relativePath, { kind: 'file', create: true });
            } catch(e) {
                // If aggressive cached retrieval failed (e.g. invalid handle), clear cache and retry
                if (this._handleCache.has(rootHandle)) {
                    this._handleCache.get(rootHandle).delete(`file:${relativePath}`);
                }
                fileHandle = await this.getHandle(rootHandle, relativePath, { kind: 'file', create: true });
            }

            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
        };

        try { await performSave(workspace.handle); } catch (e) {
            if (e.name === 'NotAllowedError') {
                if ((await workspace.handle.requestPermission({mode:'readwrite'})) === 'granted') {
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
        if (kind === 'file') await parentHandle.getFileHandle(name, { create: true });
        else await parentHandle.getDirectoryHandle(name, { create: true });
    },

    async delete(item) {
        const root = this._getRootHandle(item);
        const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
        const name = item.path.substring(item.path.lastIndexOf('/') + 1);
        const parentHandle = await this.getHandle(root, parentPath);
        
        // Invalidate cache for this item
        if (this._handleCache.has(root)) {
            const cache = this._handleCache.get(root);
            cache.delete(`${item.kind}:${item.path.replace(/^\//, '')}`);
        }
        
        await parentHandle.removeEntry(name, { recursive: true });
    },

    async rename(item, newName) {
        const root = this._getRootHandle(item);
        const path = item.path.replace(/^\//, '');
        let handle = await this.getHandle(root, path, { kind: item.kind });
        if (handle.move) {
            await handle.move(newName);
            if (this._handleCache.has(root)) {
                const cache = this._handleCache.get(root);
                cache.delete(`${item.kind}:${path}`);
                // Re-cache with new name? Complex because path changes.
                // Simpler to just delete old.
            }
        } else throw new Error("Rename not supported by your browser.");
    }
};