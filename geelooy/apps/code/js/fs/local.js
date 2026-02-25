
// B"H
// FILE: js/fs/local.js
import { State } from '../state.js';
import { IndexedDBProvider } from './indexeddb.js';

/**
 * @class LocalProvider
 * @classdesc The vessel of physical interaction with the local disk.
 * 
 * RECTIFICATION:
 * We now explicitly validate the presence of a Workspace ID before
 * attempting to resolve the root handle. If an item is detached from
 * a world (missing workspaceId and id), we treat it as a ghost and
 * provide a descriptive error rather than crashing the system.
 */
export const LocalProvider = {
    /**
     * @async
     * @function _getRootHandle
     * @description B"H. This is the seeker of the root. 
     * It ensures a workspace's physical anchor is always found.
     * @param {object} item The item being accessed.
     * @returns {FileSystemDirectoryHandle} The absolute root handle.
     */
    async _getRootHandle(item) {
        if (!item) throw new Error("The item has vanished into the void.");
        
        // Discerning the Identity
        const wsId = item.workspaceId !== undefined ? item.workspaceId : item.id;

        // 1. Mind Path: Check active memory
        const ws = State.workspaces.find(w => String(w.id) === String(wsId));
        if (ws && ws.handle) return ws.handle;
        if (item.handle) return item.handle;

        // B"H - Safeguard: If we still don't have an ID, we cannot seek.
        if (wsId === undefined || wsId === null) {
            console.error("B\"H: Local item missing identity context:", item);
            throw new Error(`The vessel for '${item.name || item.path}' is missing its World ID. It cannot be manifested.`);
        }

        // 2. Memory Path: Search persistent archives
        const restoredHandle = await IndexedDBProvider.getHandle(wsId);
        if (restoredHandle) {
            console.log(`B"H: Handle for workspace ${wsId} restored from persistence.`);
            if (ws) {
                ws.handle = restoredHandle;
                const perm = await restoredHandle.queryPermission({ mode: 'readwrite' });
                ws.isLocked = (perm !== 'granted');
            }
            return restoredHandle;
        }

        throw new Error(`The key for workspace ${wsId} has been lost. Re-open the folder to restore the connection.`);
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
