
// B"H
/**
 * @file index.js
 * @brief Refined Local Filesystem Provider for Maximum Speed.
 */

import { State } from '../../state.js';
import { IndexedDBProvider } from '../indexeddb.js';
import { HandleCache } from './handle-cache.js';
import { RecoveryRitual } from './recovery-ritual.js';
import { TraversalEngine } from './traversal-engine.js';

export const LocalProvider = {
    /**
     * @async
     * @function _getRootHandle
     * @description Retrieves the base directory handle, bypassing checks for anchored worlds.
     */
    async _getRootHandle(item) {
        const type = item.originalType || item.type;
        const wsId = item.workspaceId || item.id;
        const ws = State.workspaces.find(w => String(w.id) === String(wsId));

        if (type === 'opfs') return await navigator.storage.getDirectory();

        if (type === 'local') {
            // B"H - PERFORMANCE RITUAL: If we already have a verified handle, return it instantly.
            if (ws && ws.handle && ws.isLocked === false) {
                return ws.handle;
            }

            let handle = ws?.handle || await IndexedDBProvider.getHandle(wsId);
            if (handle) {
                const ok = await RecoveryRitual.verifyPermission(handle);
                if (ok) {
                    if (ws) {
                        ws.handle = handle;
                        ws.isLocked = false;
                    }
                    return handle;
                }
            }
            return await RecoveryRitual.attemptActivation(ws || { id: wsId, type: 'local', name: item.name });
        }
        throw new Error(`The world anchor of ${type} has dissolved.`);
    },

    /**
     * @async
     * @function getHandle
     * @description Locates a handle through the cache or recursive traversal.
     */
    async getHandle(root, path, options = {}, wsId) {
        const cacheKey = wsId || root.name; 
        const cached = HandleCache.get(cacheKey, path);
        if (cached) return cached;
        
        try {
            const handle = await TraversalEngine.walk(root, path, options);
            HandleCache.set(cacheKey, path, handle);
            return handle;
        } catch (e) {
            // If traversal failed, clear cache for this path and try one last time
            HandleCache.remove(cacheKey, path);
            const fresh = await TraversalEngine.walk(root, path, options);
            HandleCache.set(cacheKey, path, fresh);
            return fresh;
        }
    },

    /**
     * @async
     * @function read
     * @description Rapid file content retrieval.
     */
    async read(item) {
        const root = await this._getRootHandle(item);
        const wsId = item.workspaceId || item.id;
        let handle = await this.getHandle(root, item.path, { kind: 'file' }, wsId);
        try {
            return await handle.getFile();
        } catch (e) {
            HandleCache.remove(wsId, item.path);
            handle = await this.getHandle(root, item.path, { kind: 'file' }, wsId);
            return await handle.getFile();
        }
    },

    /**
     * @async
     * @function write
     * @description Lightning speed file storage using Direct Writable streams.
     */
    async write(item, content) {
        const root = await this._getRootHandle(item);
        const wsId = item.workspaceId || item.id;
        let handle = await this.getHandle(root, item.path, { kind: 'file', create: true }, wsId);
        const buffer = (content instanceof Blob) ? await content.arrayBuffer() : content;
        
        try {
            const writable = await handle.createWritable();
            await writable.write(buffer);
            await writable.close();
        } catch (e) {
            // Handle potentially stale handles
            HandleCache.remove(wsId, item.path);
            handle = await this.getHandle(root, item.path, { kind: 'file', create: true }, wsId);
            const writable = await handle.createWritable();
            await writable.write(buffer);
            await writable.close();
        }
    },

    /**
     * @async
     * @function list
     * @description Lists directory children.
     */
    async list(params) {
        const root = await this._getRootHandle(params);
        const wsId = params.workspaceId || params.id;
        const dir = await this.getHandle(root, params.path, { kind: 'directory' }, wsId);
        const entries = [];
        for await (const [name, entry] of dir.entries()) {
            entries.push({
                name, kind: entry.kind,
                path: (params.path === '/' ? '' : params.path) + '/' + name,
                workspaceId: params.workspaceId
            });
        }
        return entries;
    },

    /**
     * @async
     * @function create
     * @description Spawns a new file or directory.
     */
    async create(parent, name, kind) {
        const root = await this._getRootHandle(parent);
        const wsId = parent.workspaceId || parent.id;
        const dir = await this.getHandle(root, parent.path, { kind: 'directory' }, wsId);
        if (kind === 'file') await dir.getFileHandle(name, { create: true });
        else await dir.getDirectoryHandle(name, { create: true });
    },

    /**
     * @async
     * @function delete
     * @description Dissolves an item back into potential.
     */
    async delete(item) {
        const root = await this._getRootHandle(item);
        const wsId = item.workspaceId || item.id;
        const parts = item.path.split('/').filter(Boolean);
        const name = parts.pop();
        const parentP = '/' + parts.join('/');
        const dir = await this.getHandle(root, parentP, { kind: 'directory' }, wsId);
        await dir.removeEntry(name, { recursive: true });
        HandleCache.remove(wsId, item.path);
    }
};
