// B"H
// FILE: js/fs/local.js
import { State } from '../state.js';

export const LocalProvider = {
    _handleCache: new WeakMap(),

    _getRootHandle: function(item) {
        if (!item) throw new Error("Item is undefined in _getRootHandle");
        var wsId = item.workspaceId || item.id;
        var ws = null;
        
        if (wsId !== undefined && wsId !== null) {
            ws = State.workspaces.find(function(w) { return String(w.id) === String(wsId); });
        }
        
        // Path-based inference if ID is missing
        if (!ws && item.path) {
            for (var i = 0; i < State.workspaces.length; i++) {
                var candidate = State.workspaces[i];
                if (candidate.path && item.path.indexOf(candidate.path) === 0) {
                    ws = candidate;
                    item.workspaceId = ws.id;
                    break;
                }
            }
        }
        
        if (ws && ws.handle) return ws.handle;
        if (item.handle) return item.handle; 
        throw new Error("Local handle lost for path: " + (item.path || "root"));
    },

    async getHandle(rootHandle, path, options) {
        if (!rootHandle) throw new Error("No root handle provided.");
        var kind = (options && options.kind) || 'directory';
        var create = (options && options.create) || false;
        
        // B"H - ABSOLUTE DEFENSE: Ensure path is a string
        var rawP = (typeof path === 'string') ? path : "";
        var safePath = rawP.split("\\").join("/");
        
        var workspace = State.workspaces.find(function(w) { return w.handle === rootHandle; });
        var relativePath = safePath;

        if (workspace && typeof workspace.path === 'string') {
            var wsRoot = workspace.path;
            // Clean workspace root
            if (wsRoot.length > 0 && wsRoot.charAt(wsRoot.length - 1) === "/") {
                wsRoot = wsRoot.substring(0, wsRoot.length - 1);
            }

            if (safePath === wsRoot || safePath === wsRoot + "/") {
                relativePath = "";
            } else if (safePath.indexOf(wsRoot + "/") === 0) {
                relativePath = safePath.substring(wsRoot.length + 1);
            }
        }

        var segments = relativePath.split("/").filter(function(s) { return s !== ""; });
        var cacheKey = kind + ":" + segments.join("/");
        
        if (!this._handleCache.has(rootHandle)) {
            this._handleCache.set(rootHandle, new Map());
        }
        var cache = this._handleCache.get(rootHandle);
        if (cache.has(cacheKey)) return cache.get(cacheKey);

        let current = rootHandle;

        for (let i = 0; i < segments.length; i++) {
            var part = segments[i];
            var isLast = (i === segments.length - 1);
            try {
                if (isLast && kind === 'file') {
                    current = await current.getFileHandle(part, { create: create });
                } else {
                    current = await current.getDirectoryHandle(part, { create: create });
                }
            } catch (e) {
                cache.delete(cacheKey);
                throw e;
            }
        }
        
        cache.set(cacheKey, current);
        return current;
    },

    

    async listAllFiles(item) {
        var root = this._getRootHandle(item);
        var allFiles = [];
        var traverse = async function(dirHandle, currentPath) {
            for await (var entry of dirHandle.values()) {
                var newPath = (currentPath === "/" ? "" : currentPath) + "/" + entry.name;
                if (entry.kind === 'file') {
                    allFiles.push({ name: entry.name, kind: 'file', path: newPath, workspaceId: item.workspaceId });
                } else if (entry.kind === 'directory') {
                    try {
                        var sub = await dirHandle.getDirectoryHandle(entry.name);
                        await traverse(sub, newPath);
                    } catch(e) {}
                }
            }
        };
        var target = await this.getHandle(root, item.path, { kind: 'directory' });
        await traverse(target, item.path || "/");
        return allFiles;
    },
	async list(params) {
	        if (!params) return [];
	        var workspaceId = params.workspaceId;
	        var root;
	        try {
	            root = params.handle || this._getRootHandle(params);
	        } catch(e) { return []; }
	
	        var rawPath = (typeof params.path === 'string') ? params.path : "";
	        var cleanPath = rawPath.split("/").filter(function(p){return p!=="";}).join("/");
	        
	        var entries = [];
	        try {
	            var dirHandle = await this.getHandle(root, cleanPath, { kind: 'directory' });
	            for await (var [name, entry] of dirHandle.entries()) {
	                var base = (rawPath === "/" || !rawPath) ? "" : rawPath;
	                if (base.length > 0 && base.charAt(base.length - 1) === "/") {
	                    base = base.substring(0, base.length - 1);
	                }
	                
	                entries.push({ 
	                    name: name, 
	                    kind: entry.kind, 
	                    path: base + "/" + name,
	                    workspaceId: workspaceId
	                });
	            }
	        } catch (err) {
	            console.warn("B\"H List failed for:", rawPath, err.message);
	        }
	        return entries;
	    },
	
	    

	async read(item) {
	        var root = this._getRootHandle(item);
	        var h = await this.getHandle(root, item.path, { kind: 'file' });
	        return await h.getFile(); 
	    },
	
	    async write(item, content) {
	        var root = this._getRootHandle(item);
	        var h = await this.getHandle(root, item.path, { kind: 'file', create: true });
	        var w = await h.createWritable();
	        await w.write(content);
	        await w.close();
	    },
    async create(parentDir, name, kind) {
        const root = this._getRootHandle(parentDir);
        const h = await this.getHandle(root, parentDir.path, { kind: 'directory' });
        if (kind === 'file') await h.getFileHandle(name, { create: true });
        else await h.getDirectoryHandle(name, { create: true });
    },

    async delete(item) {
        const root = this._getRootHandle(item);
        var parts = (item.path || "").split("/").filter(function(s){return s!=="";});
        var name = parts.pop();
        var parentPath = "/" + parts.join("/");
        const h = await this.getHandle(root, parentPath, { kind: 'directory' });
        await h.removeEntry(name, { recursive: true });
    }
};