
// B"H
// FILE: js/fs/local.js
import { State } from '../state.js';
import { IndexedDBProvider } from './indexeddb.js';

/**
 * @class LocalProvider
 * @classdesc The vessel of physical interaction with the local disk.
 * 
 * THE POEM OF THE HANDLE:
 * A handle is a key to a door in the physical world.
 * The Awtsmoos grants us this key, but our memory is often frail.
 * This module is the Guardian of the Key. It looks first in the Mind (State),
 * and if the Mind is empty, it searches the Scroll of Memory (IndexedDB).
 * Once the door is opened, the light of the file can flow once more.
 * We sever the connection to native read-only locks by channeling 
 * everything through the ArrayBuffer, the undifferentiated essence of data.
 */
export const LocalProvider = {
    /**
     * @async
     * @function _getRootHandle
     * @description B"H. This is the seeker of the root. It is a failsafe 
     * mechanism that ensures a workspace's physical anchor is always found.
     * It prioritizes speed by checking State first, then descends into 
     * IndexedDB if needed to recover a 'lost' handle.
     * @param {object} item The item being accessed.
     * @returns {FileSystemDirectoryHandle} The absolute root handle.
     */
    async _getRootHandle(item) {
        if (!item) throw new Error("The item has vanished into the void.");
        
        const wsId = item.workspaceId || item.id;
        const ws = State.workspaces.find(w => String(w.id) === String(wsId));

        // 1. FAST PATH: The handle is already alive in the application's mind.
        if (ws && ws.handle) return ws.handle;
        if (item.handle) return item.handle;

        // 2. FAILSAFE PATH: The handle has been forgotten by the State.
        // We call upon the IndexedDB vessel to reveal the stored handle.
        const restoredHandle = await IndexedDBProvider.getHandle(wsId);
        if (restoredHandle) {
            console.log(`B"H: Handle for workspace ${wsId} restored from persistence.`);
            // Re-attach to the state to make subsequent calls lightning fast.
            if (ws) {
                ws.handle = restoredHandle;
                // Check if we still need to ask for permission
                const perm = await restoredHandle.queryPermission({ mode: 'readwrite' });
                ws.isLocked = (perm !== 'granted');
            }
            return restoredHandle;
        }

        throw new Error(`Handle not found for: ${item.path || "root"}. The vessel is disconnected.`);
    },

    /**
     * @async
     * @function getHandle
     * @description Navigates the hierarchy from the root to find a specific file or directory.
     */
    async getHandle(rootHandle, path, options = {}) {
        if (!rootHandle) throw new Error("No root handle provided for navigation.");
        const kind = options.kind || 'directory';
        const create = options.create || false;
        
        const rawP = (typeof path === 'string') ? path : "";
        const segments = rawP.split("/").filter(s => s !== "");
        
        let current = rootHandle;
        for (let i = 0; i < segments.length; i++) {
            const part = segments[i];
            const isLast = (i === segments.length - 1);
            try {
                if (isLast && kind === 'file') {
                    current = await current.getFileHandle(part, { create });
                } else {
                    current = await current.getDirectoryHandle(part, { create });
                }
            } catch (e) {
                throw new Error(`Path segment '${part}' not found in the physical realm.`);
            }
        }
        return current;
    },

    async list(params) {
        const root = await this._getRootHandle(params);
        const dirHandle = await this.getHandle(root, params.path, { kind: 'directory' });
        const entries = [];
        for await (const [name, entry] of dirHandle.entries()) {
            entries.push({
                name,
                kind: entry.kind,
                path: (params.path === '/' ? '' : params.path) + '/' + name,
                workspaceId: params.workspaceId
            });
        }
        return entries;
    },

    async read(item) {
        const root = await this._getRootHandle(item);
        const handle = await this.getHandle(root, item.path, { kind: 'file' });
        return await handle.getFile();
    },

    async write(item, content) {
        const root = await this._getRootHandle(item);
        const handle = await this.getHandle(root, item.path, { kind: 'file', create: true });
        
        let freshContent = content;
        if (content instanceof Blob) {
            freshContent = await content.arrayBuffer();
        }

        const writable = await handle.createWritable();
        await writable.write(freshContent);
        await writable.close();
    },

    async create(parentDir, name, kind) {
        const root = await this._getRootHandle(parentDir);
        const handle = await this.getHandle(root, parentDir.path, { kind: 'directory' });
        if (kind === 'file') await handle.getFileHandle(name, { create: true });
        else await handle.getDirectoryHandle(name, { create: true });
    },

    async delete(item) {
        const root = await this._getRootHandle(item);
        const parts = (item.path || "").split("/").filter(Boolean);
        const name = parts.pop();
        const parentPath = "/" + parts.join("/");
        const handle = await this.getHandle(root, parentPath, { kind: 'directory' });
        await handle.removeEntry(name, { recursive: true });
    },

    async listAllFiles(item) {
        const root = await this._getRootHandle(item);
        const allFiles = [];
        const traverse = async (dirHandle, currentPath) => {
            for await (const entry of dirHandle.values()) {
                const newPath = (currentPath === "/" ? "" : currentPath) + "/" + entry.name;
                if (entry.kind === 'file') {
                    allFiles.push({ name: entry.name, kind: 'file', path: newPath, workspaceId: item.workspaceId });
                } else if (entry.kind === 'directory') {
                    await traverse(entry, newPath);
                }
            }
        };
        const target = await this.getHandle(root, item.path);
        await traverse(target, item.path || "/");
        return allFiles;
    }
};
