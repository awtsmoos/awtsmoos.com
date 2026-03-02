
// B"H
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
        
        if (type === 'opfs') {
            return await navigator.storage.getDirectory();
        }
        
        if (type === 'local') {
            if (ws && ws.handle && ws.isLocked === false) return ws.handle;
            
            let handle = ws?.handle || await IndexedDBProvider.getHandle(wsId);
            if (handle) {
                const ok = await RecoveryRitual.verifyPermission(handle);
                if (ok) {
                    if (ws) { ws.handle = handle; ws.isLocked = false; }
                    return handle;
                }
            }
            
            const recoveredHandle = await RecoveryRitual.attemptActivation(ws || { id: wsId, type: 'local', name: item.name || 'Unknown' });
            
            if (!recoveredHandle) {
                if (ws) ws.isLocked = true;
                throw new Error(`The physical connection to the local workspace is locked or lost. Please re-anchor it.`);
            }
            
            return recoveredHandle;
        }
        
        throw new Error(`Workspace anchor not found for type: ${type}`);
    },
    async getHandle(root, path, options = {}, wsId) {
        if (!root) throw new Error("The root vessel is void. Cannot traverse the path.");
        const cacheKey = wsId || root.name || 'unknown_root'; 
        const cached = HandleCache.get(cacheKey, path);
        if (cached) return cached;
        const handle = await TraversalEngine.walk(root, path, options);
        HandleCache.set(cacheKey, path, handle);
        return handle;
    },
    async read(item) {
        const root = await this._getRootHandle(item);
        if (!root) throw new Error("Could not attain root handle to read.");
        const handle = await this.getHandle(root, item.path, { kind: 'file' }, item.workspaceId);
        return await handle.getFile();
    },
    async write(item, content) {
        const root = await this._getRootHandle(item);
        if (!root) throw new Error("Could not attain root handle to write.");
        const handle = await this.getHandle(root, item.path, { kind: 'file', create: true }, item.workspaceId);
        const buffer = (content instanceof Blob) ? await content.arrayBuffer() : content;
        const writable = await handle.createWritable();
        await writable.write(buffer);
        await writable.close();
    },
    async fastCopy(srcItem, destHandle, onProgress) {
        const root = await this._getRootHandle(srcItem);
        if (!root) throw new Error("Could not attain root handle for fast copy.");
        const traverse = async (curPath, targetDir) => {
            const curH = await this.getHandle(root, curPath, {}, srcItem.workspaceId);
            if (curH.kind === 'file') {
                const file = await curH.getFile();
                const newF = await targetDir.getFileHandle(curH.name, { create: true });
                const wr = await newF.createWritable();
                await wr.write(file); await wr.close();
                if (onProgress) onProgress(curPath);
            } else {
                const newD = await targetDir.getDirectoryHandle(curH.name, { create: true });
                for await (const [name, entry] of curH.entries()) {
                    await traverse((curPath === '/' ? '' : curPath) + '/' + name, newD);
                }
            }
        };
        await traverse(srcItem.path, destHandle);
    },
    async list(params) {
        const root = await this._getRootHandle(params);
        if (!root) throw new Error("Could not attain root handle to list.");
        const dir = await this.getHandle(root, params.path, { kind: 'directory' }, params.workspaceId);
        const entries =[];
        for await (const [name, entry] of dir.entries()) {
            entries.push({ name, kind: entry.kind, path: (params.path === '/' ? '' : params.path) + '/' + name, workspaceId: params.workspaceId });
        }
        return entries;
    },
    async create(parent, name, kind) {
        const root = await this._getRootHandle(parent);
        if (!root) throw new Error("Could not attain root handle to create.");
        const dir = await this.getHandle(root, parent.path, { kind: 'directory' }, parent.workspaceId);
        if (kind === 'file') await dir.getFileHandle(name, { create: true });
        else await dir.getDirectoryHandle(name, { create: true });
    },
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
