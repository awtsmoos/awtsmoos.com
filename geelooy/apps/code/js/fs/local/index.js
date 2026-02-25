
// B"H
/**
 * @file index.js
 * @brief The Supreme Coordinator of Local Physicality.
 * 
 * THE POEM OF THE RECTIFIED GATE:
 * One provider, now woven from modules of truth,
 * Combining the wisdom of age with the vigor of youth.
 * It coordinates caching and healing and walk,
 * Allowing the data and silicon to talk.
 * No error shall stand in the way of the plan,
 * For the word is manifested by the Creator's hand.
 * From the depths of the cache to the re-anchor's call,
 * This gatekeeper watches and governs it all.
 */

import { State } from '../../state.js';
import { IndexedDBProvider } from '../indexeddb.js';
import { HandleCache } from './handle-cache.js';
import { RecoveryRitual } from './recovery-ritual.js';
import { TraversalEngine } from './traversal-engine.js';

/**
 * @class LocalProvider
 * @description The primary interface for local filesystem interaction. 
 * It provides high-level rituals (read, write, list) by delegating 
 * to specialized internal engines for handle management.
 */
export const LocalProvider = {
    /**
     * @async
     * @function _getRootHandle
     * @description Internal ritual to obtain the primordial handle of a workspace.
     */
    async _getRootHandle(item) {
        const wsId = item.workspaceId || item.id;
        const ws = State.workspaces.find(w => String(w.id) === String(wsId));
        let handle = ws?.handle || await IndexedDBProvider.getHandle(wsId);

        if (handle) {
            const hasPermission = await RecoveryRitual.verifyPermission(handle);
            if (hasPermission) {
                if (ws) ws.handle = handle;
                return handle;
            }
        }

        // Handle is missing, stale, or permission was denied.
        const recovered = await RecoveryRitual.reAnchor(ws || { id: wsId, name: item.name });
        if (recovered) return recovered;

        throw new Error("Physical Coordinate Lost. The key to the world is missing.");
    },

    /**
     * @async
     * @function getHandle
     * @description Obtains a handle for a specific path, utilizing caching and falling back to traversal.
     */
    async getHandle(root, path, options = {}) {
        const wsId = root.name; // Root handle name is typically the workspace name.
        const cached = HandleCache.get(wsId, path);
        if (cached) {
            try {
                // Verify the cached spark is still alive.
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
            // Traversal failed. Clear cache and try once more from the root handle.
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
