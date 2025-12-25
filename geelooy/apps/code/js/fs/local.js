
// B"H
// FILE: js/fs/local.js
import { State } from '../state.js';
import { IndexedDBProvider } from './indexeddb.js';

export const LocalProvider = {
    _handleCache: new WeakMap(), // rootHandle -> Map(path -> handle)

    _getRootHandle(item) {
        // B"H - Priority: Global State > Item Handle
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        if (workspace && workspace.handle) return workspace.handle;
        
        if (item.handle) return item.handle; 
        
        if (!workspace) throw new Error(`Workspace not found for item: ${item.name}`);
        if (item.type === 'local' && !workspace.handle) throw new Error(`Workspace '${workspace.name}' is not connected.`);
        return workspace.handle;
    },

    async getHandle(rootHandle, path, { kind = 'directory', create = false } = {}) {
        if (!this._handleCache.has(rootHandle)) {
            this._handleCache.set(rootHandle, new Map());
        }
        const cache = this._handleCache.get(rootHandle);
        const cacheKey = `${kind}:${path}`;

        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        let currentHandle = rootHandle;
        const decodedPath = path.replace(/^\//, '');

        if (!decodedPath) return rootHandle;

        const parts = decodedPath.split('/');
        
        // B"H - Traverse from root to ensure validity
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;
            const isLastPart = i === parts.length - 1;
            
            try {
                if (!isLastPart) {
                    // Check cache for intermediate folders
                    const subPath = parts.slice(0, i+1).join('/');
                    const subKey = `directory:${subPath}`;
                    
                    if (cache.has(subKey)) {
                        currentHandle = cache.get(subKey);
                    } else {
                        currentHandle = await currentHandle.getDirectoryHandle(part, { create });
                        cache.set(subKey, currentHandle);
                    }
                } else {
                    // Final element
                    if (kind === 'file') {
                        currentHandle = await currentHandle.getFileHandle(part, { create });
                    } else {
                        currentHandle = await currentHandle.getDirectoryHandle(part, { create });
                    }
                }
            } catch (e) {
                // If we hit a snag, clear intermediate cache for this path and re-throw
                console.error(`[LocalProvider] Failed to get handle for part: "${part}" in path: "${path}"`, e);
                cache.delete(cacheKey);
                throw e;
            }
        }
        
        cache.set(cacheKey, currentHandle);
        return currentHandle;
    },

    // B"H - Brutal Cache Clear: Wipes memory AND reloads root handle from IDB
    async clearCache(item, brutal = false) {
        try {
            // Resolve the workspace
            const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
            
            // Get current root handle (might be stale)
            const root = workspace ? workspace.handle : (item.handle || null);
            
            // 1. Wipe Memory Cache
            if (root && this._handleCache.has(root)) {
                if (brutal || item.path === '/') {
                    this._handleCache.delete(root);
                    console.log("[LocalProvider] Cache TOTALLY Annihilated (Brutal Refresh)");
                } else {
                    // Selective clear for sub-paths
                    const cache = this._handleCache.get(root);
                    const path = item.path.replace(/^\//, '');
                    const keysToDelete = [];
                    for (const key of cache.keys()) {
                        if (key.includes(path)) keysToDelete.push(key);
                    }
                    keysToDelete.forEach(k => cache.delete(k));
                }
            }

            // 2. Refresh Root Handle from Disk (IndexedDB)
            // This mimics the "Close and Reopen" behavior the user requested.
            if (brutal && item.type === 'local' && workspace) {
                try {
                    // Force fresh fetch from DB
                    const freshHandle = await IndexedDBProvider.getHandle(workspace.id);
                    if (freshHandle) {
                        workspace.handle = freshHandle;
                        // Pre-warm the new cache entry to ensure zero leakage
                        this._handleCache.set(freshHandle, new Map());
                        console.log("[LocalProvider] Root Handle Refreshed from Disk.");
                    } else {
                        console.warn("[LocalProvider] No handle found in IDB for refresh.");
                    }
                } catch(e) {
                    console.error("[LocalProvider] Failed to refresh handle from IDB:", e);
                }
            }

        } catch(e) {
            console.warn("Failed to clear local cache:", e);
        }
    },

    async list({ handle, path, workspaceId }) {
        // B"H - Ensure we use the latest handle from workspace if valid
        const ws = State.workspaces.find(w => w.id === workspaceId);
        const root = handle || (ws ? ws.handle : null);
        
        if (!root) throw new Error("No handle available for listing");
        
        // B"H - Force fresh traversal logic on list if path is complex
        const dirHandle = await this.getHandle(root, path);
        const entries = [];
        
        // B"H - HIGH STABILITY LISTING
        // Iterate with extra safety against "cut out" issues.
        try {
            // Using a simple array push via for-await prevents some generator weirdness
            for await (const [name, entry] of dirHandle.entries()) {
                entries.push({ 
                    name: name, 
                    kind: entry.kind, 
                    path: `${path === '/' ? '' : path}/${name}`,
                    workspaceId: workspaceId,
                    size: 0, 
                    lastModified: 0 
                });
            }
        } catch (iteratorError) {
            console.error(`Failed to fully iterate directory ${path}:`, iteratorError);
            // If the iterator fails but gave us partials, we return them.
            // We do NOT re-throw because a partial list is better than nothing,
            // and the user can try refreshing again.
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
                    const subHandle = await dirHandle.getDirectoryHandle(entry.name);
                    await traverse(subHandle, newPath);
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
            
            // Retry logic for stale handles
            let fileHandle;
            try {
                fileHandle = await this.getHandle(rootHandle, relativePath, { kind: 'file', create: true });
            } catch(e) {
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
        
        // Invalidate cache
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
            }
        } else throw new Error("Rename not supported by your browser.");
    }
};
