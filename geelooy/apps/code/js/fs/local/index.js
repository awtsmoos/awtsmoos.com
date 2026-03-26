
// B"H
/**
 * @file local/index.js
 * @brief The Core Engine for Local File Interaction.
 * 
 * THE POEM OF THE SECURE AND RAPID DESCENTS:
 * The data flows like water from the highest peak,
 * Down into the valleys where the functions speak.
 * If the gate is open and the path is bright,
 * We bypass the wardens and travel as light!
 * No needless checks to slow the Creator's hand,
 * When the anchor holds firm in the digital land.
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
     * @description Reaches for the absolute origin of the workspace.
     * B"H - Optimized for Lightning Speed. Avoids all async overhead if the handle is already locked in and verified.
     */
    async _getRootHandle(item) {
        const type = item.originalType || item.type;
        const wsId = item.workspaceId || item.id;
        
        if (type === 'opfs') {
            return await navigator.storage.getDirectory();
        }
        
        if (type === 'local') {
            const ws = State.workspaces.find(w => String(w.id) === String(wsId));
            
            // LIGHTNING FAST PATH: If we already have the handle and it's explicitly unlocked, return immediately!
            if (ws && ws.handle && !ws.isLocked) {
                return ws.handle;
            }
            
            // If we have a handle but it might be "locked" from a page reload, silently verify it.
            if (ws && ws.handle) {
                const status = await ws.handle.queryPermission({ mode: 'readwrite' });
                if (status === 'granted') {
                    ws.isLocked = false;
                    return ws.handle;
                }
            }
            
            // Attempt Activation (checks IndexedDB). We do NOT prompt here. 
            // If it fails, we throw, and the UI will show the "RESUME" button on the folder.
            const recoveredHandle = await RecoveryRitual.attemptActivation(ws || { id: wsId, type: 'local', name: item.name || 'Unknown' });
            
            if (!recoveredHandle) {
                if (ws) ws.isLocked = true;
                throw new Error(`WorkspaceCorruptedError: The physical connection to the local workspace is locked or lost. Please click RESUME in the sidebar.`);
            }
            
            if (ws) {
                ws.handle = recoveredHandle;
                ws.isLocked = false;
            }
            
            return recoveredHandle;
        }
        
        throw new Error(`Workspace anchor not found for type: ${type}`);
    },

    /**
     * @async
     * @function getHandle
     * @description Navigates down to a specific file or folder.
     */
    async getHandle(root, path, options = {}, wsId) {
        if (!root) throw new Error("The root vessel is void. Cannot traverse the path.");
        const cacheKey = wsId || root.name || 'unknown_root'; 
        
        // Instant memory access!
        const cached = HandleCache.get(cacheKey, path);
        if (cached) return cached;
        
        const handle = await TraversalEngine.walk(root, path, options);
        HandleCache.set(cacheKey, path, handle);
        return handle;
    },

    /**
     * @async
     * @function read
     * @description Extracts the essence of a file.
     */
    async read(item) {
        const root = await this._getRootHandle(item);
        if (!root) throw new Error("Could not attain root handle to read.");
        const handle = await this.getHandle(root, item.path, { kind: 'file' }, item.workspaceId);
        return await handle.getFile();
    },

    /**
     * @async
     * @function write
     * @description Inscribes essence into a file at lightning speed.
     */
    async write(item, content) {
        const root = await this._getRootHandle(item);
        if (!root) throw new Error("Could not attain root handle to write.");
        const handle = await this.getHandle(root, item.path, { kind: 'file', create: true }, item.workspaceId);
        const buffer = (content instanceof Blob) ? await content.arrayBuffer() : content;
        
        const writable = await handle.createWritable();
        try {
            await writable.write(buffer);
        } finally {
            await writable.close();
        }
    },

    /**
     * @async
     * @function fastCopy
     * @description B"H - Deeply rectified high-speed transfer. 
     * Wraps operations in try/catch to ensure one locked file doesn't hang the entire ritual.
     */
    async fastCopy(srcItem, destHandle, onProgress) {
        const root = await this._getRootHandle(srcItem);
        if (!root) throw new Error("Could not attain root handle for fast copy.");
        
        const traverse = async (curPath, targetDir) => {
            try {
                const curH = await this.getHandle(root, curPath, {}, srcItem.workspaceId);
                
                if (curH.kind === 'file') {
                    const file = await curH.getFile();
                    const newF = await targetDir.getFileHandle(curH.name, { create: true });
                    
                    try {
                        const wr = await newF.createWritable();
                        await wr.write(file); 
                        await wr.close();
                    } catch (writeErr) {
                        console.warn(`[LocalProvider] FastCopy write blocked on ${curH.name}:`, writeErr);
                    }
                    
                    if (onProgress) onProgress(curPath);
                } else {
                    const newD = await targetDir.getDirectoryHandle(curH.name, { create: true });
                    for await (const [name, entry] of curH.entries()) {
                        await traverse((curPath === '/' ? '' : curPath) + '/' + name, newD);
                    }
                }
            } catch (traverseErr) {
                console.warn(`[LocalProvider] FastCopy traversal blocked at ${curPath}:`, traverseErr);
            }
        };
        
        await traverse(srcItem.path, destHandle);
    },

    /**
     * @async
     * @function list
     * @description Lists the contents of a directory.
     */
    async list(params) {
        const root = await this._getRootHandle(params);
        if (!root) throw new Error("Could not attain root handle to list.");
        const dir = await this.getHandle(root, params.path, { kind: 'directory' }, params.workspaceId);
        const entries = [];
        for await (const [name, entry] of dir.entries()) {
            entries.push({ name, kind: entry.kind, path: (params.path === '/' ? '' : params.path) + '/' + name, workspaceId: params.workspaceId });
        }
        return entries;
    },

    /**
     * @async
     * @function create
     * @description Forces a new node into physical existence.
     */
    async create(parent, name, kind) {
        const root = await this._getRootHandle(parent);
        if (!root) throw new Error("Could not attain root handle to create.");
        const dir = await this.getHandle(root, parent.path, { kind: 'directory' }, parent.workspaceId);
        if (kind === 'file') await dir.getFileHandle(name, { create: true });
        else await dir.getDirectoryHandle(name, { create: true });
    },

    /**
     * @async
     * @function delete
     * @description Plucks a vessel from the filesystem tree.
     */
    async delete(item) {
        const root = await this._getRootHandle(item);
        if (!root) throw new Error("Could not attain root handle to delete.");
        const parts = item.path.split('/').filter(Boolean);
        const name = parts.pop();
        const parentP = '/' + parts.join('/');
        const dir = await this.getHandle(root, parentP, { kind: 'directory' }, item.workspaceId);
        await dir.removeEntry(name, { recursive: true });
        HandleCache.remove(item.workspaceId, item.path);
    }
};
