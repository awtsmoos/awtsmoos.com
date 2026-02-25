
// B"H
// FILE: js/fs/local.js

import { State } from '../state.js';
import { IndexedDBProvider } from './indexeddb.js';

/**
 * @class LocalProvider
 * @description Optimized vessel for physical disk interaction. 
 * High speed (lightning) is achieved through efficient handle caching and 
 * minimizing the conversion rituals. It treats the FileSystem API as a 
 * sacred bridge to the physical world.
 */
export const LocalProvider = {
    _handleCache: new Map(), // WorkspaceId + Path -> Handle

    async _getRootHandle(item) {
        const wsId = item.workspaceId || item.id;
        const ws = State.workspaces.find(w => String(w.id) === String(wsId));
        if (ws && ws.handle) return ws.handle;
        
        const restored = await IndexedDBProvider.getHandle(wsId);
        if (restored) {
            if (ws) ws.handle = restored;
            return restored;
        }
        throw new Error("Handle not found. The key to the world is missing.");
    },

    async getHandle(root, path, options = {}) {
        const cacheKey = `${root.name}::${path}::${options.kind}`;
        if (this._handleCache.has(cacheKey)) return this._handleCache.get(cacheKey);

        const segments = path.split("/").filter(s => s !== "");
        let current = root;
        for (let i = 0; i < segments.length; i++) {
            const part = segments[i];
            const isLast = (i === segments.length - 1);
            if (isLast && options.kind === 'file') {
                current = await current.getFileHandle(part, { create: options.create });
            } else {
                current = await current.getDirectoryHandle(part, { create: options.create });
            }
        }
        this._handleCache.set(cacheKey, current);
        return current;
    },

    async read(item) {
        const root = await this._getRootHandle(item);
        const handle = await this.getHandle(root, item.path, { kind: 'file' });
        const file = await handle.getFile();
        // Lightning fast: stream directly to buffer
        return file;
    },

    async write(item, content) {
        const root = await this._getRootHandle(item);
        const handle = await this.getHandle(root, item.path, { kind: 'file', create: true });
        
        // Severing OS locks with ArrayBuffer conversion
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
                name,
                kind: entry.kind,
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
