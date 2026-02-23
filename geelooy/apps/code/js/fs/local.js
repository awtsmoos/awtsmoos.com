// B"H
// FILE: js/fs/local.js
import { State } from '../state.js';

export const LocalProvider = {
    _handleCache: new WeakMap(),

    _getRootHandle: function(item) {
	    // 1. Direct ID lookup (Fastest)
	    var wsId = item.workspaceId || item.id;
	    var ws = null;
	    
	    if (wsId !== undefined && wsId !== null) {
	        ws = State.workspaces.find(function(w) { return w.id === wsId; });
	    }
	
	    // 2. BULLETPROOF FALLBACK: Path Inference
	    // If ID is missing, find the workspace whose root path matches this item
	    if (!ws && item.path) {
	        for (var i = 0; i < State.workspaces.length; i++) {
	            var candidate = State.workspaces[i];
	            // If the item path starts with the workspace path, it belongs here
	            if (item.path.indexOf(candidate.path) === 0) {
	                ws = candidate;
	                // Repair the item for future calls
	                item.workspaceId = ws.id; 
	                break;
	            }
	        }
	    }
	
	    if (ws && ws.handle) return ws.handle;
	    if (item.handle) return item.handle; 
	    
	    throw new Error("Local handle lost for workspace ID " + wsId + " (Path: " + (item.path || "root") + ")");
	},

    async getHandle(rootHandle, path, { kind = 'directory', create = false } = {}) {
        if (!rootHandle) throw new Error("No root handle provided to FS.");
        
        // B"H - Manual protection against undefined path
        const p = path || "";
        const safePath = p.split("\\").join("/");

        if (!this._handleCache.has(rootHandle)) {
            this._handleCache.set(rootHandle, new Map());
        }
        const cache = this._handleCache.get(rootHandle);
        const cacheKey = kind + ":" + safePath;

        if (cache.has(cacheKey)) return cache.get(cacheKey);

        let currentHandle = rootHandle;
        const parts = safePath.split("/").filter(Boolean);
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = (i === parts.length - 1);
            try {
                if (!isLast) {
                    currentHandle = await currentHandle.getDirectoryHandle(part, { create });
                } else {
                    if (kind === 'file') {
                        currentHandle = await currentHandle.getFileHandle(part, { create });
                    } else {
                        currentHandle = await currentHandle.getDirectoryHandle(part, { create });
                    }
                }
            } catch (e) {
                cache.delete(cacheKey);
                throw e;
            }
        }
        
        cache.set(cacheKey, currentHandle);
        return currentHandle;
    },

    async list({ handle, path, workspaceId }) {
        const root = handle || this._getRootHandle({ workspaceId });
        if (!root) throw new Error("Listing requires a handle.");
        
        const safePath = path || "/";
        const dirHandle = await this.getHandle(root, safePath);
        const entries = [];
        
        try {
            for await (const [name, entry] of dirHandle.entries()) {
                const prefix = (safePath === "/" || !safePath) ? "" : safePath;
                entries.push({ 
                    name, 
                    kind: entry.kind, 
                    path: prefix + "/" + name,
                    workspaceId
                });
            }
        } catch (err) {
            console.error("B\"H - List failed:", err);
        }
        return entries;
    },
    
    listAllFiles: async function(item) {
	    var self = this;
	    var root = this._getRootHandle(item);
	    var allFiles = [];
	
	    // B"H - Recursive traversal ritual
	    var traverse = async function(dirHandle, currentPath) {
	        for await (var entry of dirHandle.values()) {
	            // Manual path join: No regex
	            var newPath = (currentPath === "/" ? "" : currentPath) + "/" + entry.name;
	            
	            if (entry.kind === 'file') {
	                allFiles.push({
	                    name: entry.name,
	                    kind: 'file',
	                    path: newPath,
	                    workspaceId: item.workspaceId
	                });
	            } else if (entry.kind === 'directory') {
	                try {
	                    var subHandle = await dirHandle.getDirectoryHandle(entry.name);
	                    await traverse(subHandle, newPath);
	                } catch(e) {
	                    console.warn("B\"H - Could not traverse: " + entry.name);
	                }
	            }
	        }
	    };
	
	    // Determine starting handle
	    var relPath = item.path || "";
	    if (relPath.indexOf("/") === 0) relPath = relPath.substring(1);
	    
	    var targetHandle = await this.getHandle(root, relPath, { kind: 'directory' });
	    await traverse(targetHandle, item.path || "/");
	    
	    return allFiles;
	},

    async read(item) {
        const root = this._getRootHandle(item);
        const path = item.path || "";
        const rel = path.startsWith("/") ? path.substring(1) : path;
        const h = await this.getHandle(root, rel, { kind: 'file' });
        return await h.getFile(); 
    },

    async write(item, content) {
        const root = this._getRootHandle(item);
        const path = item.path || "";
        const rel = path.startsWith("/") ? path.substring(1) : path;
        const h = await this.getHandle(root, rel, { kind: 'file', create: true });
        const w = await h.createWritable();
        await w.write(content);
        await w.close();
    },

    async create(parentDir, name, kind) {
        const root = this._getRootHandle(parentDir);
        const h = await this.getHandle(root, parentDir.path || "");
        if (kind === 'file') await h.getFileHandle(name, { create: true });
        else await h.getDirectoryHandle(name, { create: true });
    },

    async delete(item) {
        const root = this._getRootHandle(item);
        const p = item.path || "";
        const parts = p.split("/");
        const name = parts.pop();
        const parentPath = parts.join("/") || "/";
        const h = await this.getHandle(root, parentPath);
        await h.removeEntry(name, { recursive: true });
    }
};
