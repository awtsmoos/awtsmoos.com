// B"H
// FILE: js/fs/local.js
import { State } from '../state.js';

export const LocalProvider = {
    // B"H - Cache to speed up repeated accesses (WeakMap key: rootHandle -> Map(path -> handle))
    _handleCache: new WeakMap(),

    _getRootHandle(item) {
        if (item.handle) return item.handle; 
        
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        if (!workspace) throw new Error(`Workspace not found for item: ${item.name}`);
        if (!workspace.handle) throw new Error(`Workspace '${workspace.name}' is not connected (Locked or Lost).`);
        
        return workspace.handle;
    },

    async getHandle(rootHandle, path, { kind = 'directory', create = false } = {}) {
        // B"H - Optimization: Check Cache
        // We only cache READS for now to be safe, or cache aggressively if not creating.
        // Let's implement a simple memory cache attached to the rootHandle object.
        
        if (!this._handleCache.has(rootHandle)) {
            this._handleCache.set(rootHandle, new Map());
        }
        const cache = this._handleCache.get(rootHandle);
        const cacheKey = `${kind}:${path}`; // Key by kind+path

        if (!create && cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        let currentHandle = rootHandle;
        const decodedPath = decodeURIComponent(path).replace(/^\//, '');

        if (!decodedPath) return rootHandle;

        const parts = decodedPath.split('/');
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;

            const isLastPart = i === parts.length - 1;

            // Try to resolve intermediate parts from cache to speed up deep access
            // Construct partial path
            if (!isLastPart) {
                // Optimization: If we had a full path cache logic we could skip, but let's just do handle stepping.
                // For now, simple stepping is robust.
                currentHandle = await currentHandle.getDirectoryHandle(part, { create });
            } else {
                if (kind === 'file') {
                    currentHandle = await currentHandle.getFileHandle(part, { create });
                } else {
                    currentHandle = await currentHandle.getDirectoryHandle(part, { create });
                }
            }
        }
        
        // Update Cache
        if (!create) {
            cache.set(cacheKey, currentHandle);
        }
        
        return currentHandle;
    },

    async list({ handle, path, workspaceId }) {
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
                } catch(e) { }
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
        if (!workspace) throw new Error(`Critical error: Parent workspace not found.`);
        
        const performSave = async (rootHandle) => {
            // B"H - Ensure the handle used for writing is fresh or valid
            const fileHandle = await this.getHandle(rootHandle, item.path, { kind: 'file', create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
        };

        try {
            await performSave(workspace.handle);
        } catch (e) {
            if (e.name === 'NotAllowedError' || e.message.includes('state had changed')) {
                console.warn(`Stale handle for "${workspace.name}". Requesting permission/re-select.`);
                if ((await workspace.handle.queryPermission({mode:'readwrite'})) !== 'granted') {
                    await workspace.handle.requestPermission({mode:'readwrite'});
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
        
        // Invalidate cache for the parent path if we're creating something? 
        // Not strictly needed as getHandle doesn't cache children lists, only direct handles.
        
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
        
        // Invalidate specific cache entry if it exists
        if (this._handleCache.has(root)) {
            const cache = this._handleCache.get(root);
            const key = `${item.kind}:${item.path.startsWith('/') ? item.path.substring(1) : item.path}`;
            cache.delete(key);
        }
        
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
            
            // Invalidate cache for old path
            if (this._handleCache.has(root)) {
                const cache = this._handleCache.get(root);
                const key = `${item.kind}:${path}`;
                cache.delete(key);
            }
        } else {
            throw new Error("Rename is not supported by your browser (Requires File System Access API 'move').");
        }
    }
};