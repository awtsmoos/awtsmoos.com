
// B"H
/**
 * @file index.js
 * @brief Coordinator of Physical and Internal Browser Storage.
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
     * @description Distinguishes between internal browser nature and external physical handles.
     */
    async _getRootHandle(item) {
        const type = item.originalType || item.type;
        const wsId = item.workspaceId || item.id;
        const ws = State.workspaces.find(w => String(w.id) === String(wsId));

        // 1. THE INTERNAL WORLD (OPFS)
        // Manifests from the origin's potential, no picker required.
        if (type === 'opfs') {
            const handle = await navigator.storage.getDirectory();
            if (ws) ws.handle = handle;
            return handle;
        }

        // 2. THE PHYSICAL WORLD (Local File System API)
        if (type === 'local') {
            let handle = ws?.handle || await IndexedDBProvider.getHandle(wsId);
            if (handle) {
                const ok = await RecoveryRitual.verifyPermission(handle);
                if (ok) {
                    if (ws) ws.handle = handle;
                    return handle;
                }
            }
            // If lost or locked, call the specific recovery ritual
            const recovered = await RecoveryRitual.reAnchor(ws || { id: wsId, type: 'local', name: item.name });
            if (recovered) return recovered;
        }

        throw new Error(`The vessel ${wsId} (${type}) has no handle.`);
    },

    async getHandle(root, path, options = {}) {
        const wsId = root.name; 
        const cached = HandleCache.get(wsId, path);
        if (cached) {
            try {
                if (options.kind === 'file') await cached.getFile();
                else await (await cached.entries().next());
                return cached;
            } catch (e) {
                HandleCache.remove(wsId, path);
            }
        }
        try {
            const handle = await TraversalEngine.walk(root, path, options);
            HandleCache.set(wsId, path, handle);
            return handle;
        } catch (e) {
            HandleCache.clear();
            const fresh = await TraversalEngine.walk(root, path, options);
            HandleCache.set(wsId, path, fresh);
            return fresh;
        }
    },

    async read(item) {
        const root = await this._getRootHandle(item);
        const handle = await this.getHandle(root, item.path, { kind: 'file' });
        // Max speed: direct access to the stream
        return await handle.getFile();
    },

    async write(item, content) {
        const root = await this._getRootHandle(item);
        const handle = await this.getHandle(root, item.path, { kind: 'file', create: true });
        const buffer = (content instanceof Blob) ? await content.arrayBuffer() : content;
        const writable = await handle.createWritable();
        await writable.write(buffer);
        await writable.close();
    },

    async list(params) {
        const root = await this._getRootHandle(params);
        const dir = await this.getHandle(root, params.path, { kind: 'directory' });
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

    async create(parent, name, kind) {
        const root = await this._getRootHandle(parent);
        const dir = await this.getHandle(root, parent.path, { kind: 'directory' });
        if (kind === 'file') await dir.getFileHandle(name, { create: true });
        else await dir.getDirectoryHandle(name, { create: true });
    },

    async delete(item) {
        const root = await this._getRootHandle(item);
        const parts = item.path.split('/').filter(Boolean);
        const name = parts.pop();
        const parentP = '/' + parts.join('/');
        const dir = await this.getHandle(root, parentP, { kind: 'directory' });
        await dir.removeEntry(name, { recursive: true });
    },

    async listAllFiles(item) {
        const root = await this._getRootHandle(item);
        const startDir = await this.getHandle(root, item.path, { kind: 'directory' });
        const allFiles = [];
        const walk = async (dirHandle, currentPath) => {
            for await (const [name, entry] of dirHandle.entries()) {
                const fullPath = `${currentPath}/${name}`;
                if (entry.kind === 'file') allFiles.push({ name, kind: 'file', path: fullPath, workspaceId: item.workspaceId });
                else await walk(entry, fullPath);
            }
        };
        await walk(startDir, item.path === '/' ? '' : item.path);
        return allFiles;
    }
};
