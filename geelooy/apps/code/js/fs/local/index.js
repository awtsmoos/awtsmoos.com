
// B"H
/**
 * @file index.js
 * @brief Refined Local Filesystem Provider.
 */

import { State } from '../../state.js';
import { IndexedDBProvider } from '../indexeddb.js';
import { HandleCache } from './handle-cache.js';
import { RecoveryRitual } from './recovery-ritual.js';
import { TraversalEngine } from './traversal-engine.js';

export const LocalProvider = {
    async _getRootHandle(item) {
        const type = item.originalType || item.type;
        const wsId = item.workspaceId || item.id;
        const ws = State.workspaces.find(w => String(w.id) === String(wsId));

        if (type === 'opfs') return await navigator.storage.getDirectory();

        if (type === 'local') {
            let handle = ws?.handle || await IndexedDBProvider.getHandle(wsId);
            if (handle) {
                // Correct ritual call: ensure we call the function that exists!
                const ok = await RecoveryRitual.verifyPermission(handle);
                if (ok) {
                    if (ws) ws.handle = handle;
                    return handle;
                }
            }
            return await RecoveryRitual.attemptActivation(ws || { id: wsId, type: 'local', name: item.name });
        }
        throw new Error(`The world of ${type} is missing its anchor.`);
    },

    async getHandle(root, path, options = {}) {
        const wsId = root.name; 
        const cached = HandleCache.get(wsId, path);
        if (cached) {
            try {
                if (options.kind === 'file') await cached.getFile();
                else await (await cached.entries().next());
                return cached;
            } catch (e) { HandleCache.remove(wsId, path); }
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
    }
};
