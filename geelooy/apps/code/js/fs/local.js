
// B"H
// FILE: js/fs/local.js
import { State } from '../state.js';

/**
 * --- LOCAL PROVIDER (RECTIFIED) ---
 * B"H - Updated to solve the Android "Read-Only" Shevirah.
 * When copying files, we now force all Blobs/Files into fresh ArrayBuffers.
 * This severs the connection to native OS handles that are locked for writing.
 */
export const LocalProvider = {
    _handleCache: new WeakMap(),

    _getRootHandle(item) {
        if (!item) throw new Error("Item lost in the void.");
        const wsId = item.workspaceId || item.id;
        const ws = State.workspaces.find(w => String(w.id) === String(wsId));
        if (ws && ws.handle) return ws.handle;
        if (item.handle) return item.handle; 
        throw new Error(`Handle not found for: ${item.path || "root"}`);
    },

    async getHandle(rootHandle, path, options = {}) {
        if (!rootHandle) throw new Error("No root handle provided.");
        const kind = options.kind || 'directory';
        const create = options.create || false;
        
        const rawP = (typeof path === 'string') ? path : "";
        const segments = rawP.split("/").filter(s => s !== "");
        
        let current = rootHandle;
        for (let i = 0; i < segments.length; i++) {
            const part = segments[i];
            const isLast = (i === segments.length - 1);
            if (isLast && kind === 'file') {
                current = await current.getFileHandle(part, { create });
            } else {
                current = await current.getDirectoryHandle(part, { create });
            }
        }
        return current;
    },

    async list(params) {
        const root = this._getRootHandle(params);
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
        const root = this._getRootHandle(item);
        const handle = await this.getHandle(root, item.path, { kind: 'file' });
        return await handle.getFile();
    },

    /**
     * B"H - THE ANDROID RECTIFICATION
     * We convert incoming Blobs/Files to ArrayBuffers. This memory-based 
     * representation is writable even if the source was a read-only native File.
     */
    async write(item, content) {
        const root = this._getRootHandle(item);
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
        const root = this._getRootHandle(parentDir);
        const handle = await this.getHandle(root, parentDir.path, { kind: 'directory' });
        if (kind === 'file') await handle.getFileHandle(name, { create: true });
        else await handle.getDirectoryHandle(name, { create: true });
    },

    async delete(item) {
        const root = this._getRootHandle(item);
        const parts = (item.path || "").split("/").filter(Boolean);
        const name = parts.pop();
        const parentPath = "/" + parts.join("/");
        const handle = await this.getHandle(root, parentPath, { kind: 'directory' });
        await handle.removeEntry(name, { recursive: true });
    },

    async rename(item, newName) {
        const root = this._getRootHandle(item);
        const handle = await this.getHandle(root, item.path, { kind: 'file' });
        // Standard FileSystemHandle rename (if supported)
        if (handle.move) {
            await handle.move(newName);
        } else {
            // Fallback: Read, Write New, Delete Old
            const content = await this.read(item);
            const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
            await this.write({ ...item, path: parentPath + '/' + newName }, content);
            await this.delete(item);
        }
    },

    async listAllFiles(item) {
        const root = this._getRootHandle(item);
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
