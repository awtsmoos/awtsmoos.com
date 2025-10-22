// B"H
// FILE: js/fs-provider.js

import { State } from './state.js';
import { MimeUtil } from './mime-util.js';
/**
 * FileSystemProvider: An abstraction layer for different file systems.
 */
export const FileSystemProvider = {
    async list(item) {
        try {
            switch (item.type) {
                case 'local': return this.Local.list(item);
                case 'indexeddb': return this.IndexedDB.list(item);
                case 'github': return this.GitHub.list(item);
                default: throw new Error('Unsupported workspace type');
            }
        } catch (e) { console.error(`[FS LIST FAILED]`, e); throw e; }
    },
    async read(item) {
        try {
            switch (item.type) {
                case 'local': return this.Local.read(item);
                case 'indexeddb': return this.IndexedDB.read(item);
                case 'github': return this.GitHub.read(item);
            }
        } catch (e) { console.error(`[FS READ FAILED]`, e); throw e; }
    },
    async write(item, content, commitMessage) {
        try {
            switch (item.type) {
                case 'local': return this.Local.write(item, content);
                case 'indexeddb': return this.IndexedDB.write(item, content);
                case 'github': return this.GitHub.write(item, content, commitMessage);
            }
        } catch (e) { console.error(`[FS WRITE FAILED]`, e); throw e; }
    },
    async create(parentDir, name, kind) {
        try {
            switch (parentDir.type) {
                case 'local': return this.Local.create(parentDir, name, kind);
                case 'indexeddb': return this.IndexedDB.create(parentDir, name, kind);
                case 'github': return this.GitHub.create(parentDir, name, kind);
            }
        } catch (e) { console.error(`[FS CREATE FAILED]`, e); throw e; }
    },
    async delete(item) {
        try {
            switch (item.type) {
                case 'local': return this.Local.delete(item);
                case 'indexeddb': return this.IndexedDB.delete(item);
                case 'github': return this.GitHub.delete(item);
            }
        } catch (e) { console.error(`[FS DELETE FAILED]`, e); throw e; }
    },

    Local: {
        // ... (Local implementation remains unchanged)
        async getHandle(rootHandle, path, { kind, create = false } = {}) {
    // --- THE ABSOLUTE FIX ---
    // The File System Access API expects plain names, not URL-encoded strings.
    // We must decode the path before trying to access handles.
    const decodedPath = decodeURIComponent(path);

    let currentHandle = rootHandle;
    if (!decodedPath || decodedPath === '/') return currentHandle;
    
    // Use the decoded path from now on.
    const parts = decodedPath.split('/').filter(p => p);
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        
        // This is a guard against empty parts from paths like "//"
        if (!part) continue;

        if (isLast && kind === 'file') {
            return await currentHandle.getFileHandle(part, { create });
        }
        currentHandle = await currentHandle.getDirectoryHandle(part, { create });
    }
    return currentHandle;
},
        async list({ handle, path }) {
    const dirHandle = await this.getHandle(handle, path);
    const entries = [];
    for await (const entry of dirHandle.values()) {
        entries.push({ 
            name: entry.name, kind: entry.kind, 
            path: `${path === '/' ? '' : path}/${entry.name}`, 
        });
    }
    return entries;
},
        async read({ handle, path }) {
    const fileHandle = await this.getHandle(handle, path, { kind: 'file' });
    // Return the entire File object, which is a Blob. This is more versatile.
    return await fileHandle.getFile(); 
},
        
        
        async write({ handle, path }, content) {
    const fileHandle = await this.getHandle(handle, path, { kind: 'file' });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
},
        async create({ handle, path }, name, kind) {
    const parentHandle = await this.getHandle(handle, path, { kind: 'directory' });
    if (kind === 'file') await parentHandle.getFileHandle(name, { create: true });
    else await parentHandle.getDirectoryHandle(name, { create: true });
},
        async delete({ handle, path }) {
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const name = path.substring(path.lastIndexOf('/') + 1);
    const parentHandle = await this.getHandle(handle, parentPath);
    await parentHandle.removeEntry(name, { recursive: true });
}
    },
    IndexedDB: {
        DB_NAME: "VIVID_X_FS_PROFOUND",
        STORE_NAME: "files",
        
        // B"H --- FIX STARTS HERE ---
        // Changed all arrow functions to regular 'function()' to correctly scope 'this'.
        init: function() {
            return new Promise((resolve, reject) => {
                if (State.db) return resolve(State.db);
                // 'this.DB_NAME' now correctly refers to "VIVID_X_FS_PROFOUND"
                const request = indexedDB.open(this.DB_NAME, 1);
                request.onupgradeneeded = e => e.target.result.createObjectStore(this.STORE_NAME, { keyPath: "path" });
                request.onsuccess = e => { State.db = e.target.result; resolve(State.db); };
                request.onerror = e => { console.error("IndexedDB init failed:", e.target.error); reject(e.target.error); };
            });
        },
        list: async function({ path }) {
            await this.init(); // Ensure DB is initialized
            return new Promise((resolve, reject) => {
                const store = State.db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
                const request = store.getAll();
                request.onerror = e => reject(e.target.error);
                request.onsuccess = () => {
                    const children = new Map();
                    const dirPrefix = path === '/' ? '' : path + '/';
                    request.result.forEach(item => {
                        if (item.path.startsWith(dirPrefix) && item.path !== path) {
                             const relativePath = item.path.substring(dirPrefix.length);
                            const segment = relativePath.split('/')[0];
                            if (segment && !children.has(segment)) {
                                const isDir = relativePath.includes('/') || item.isDir;
                                children.set(segment, { 
                                    name: segment, kind: isDir ? 'directory' : 'file', 
                                    path: dirPrefix + segment
                                });
                            }
                        }
                    });
                    resolve(Array.from(children.values()));
                };
            });
        },
        read: async function({ path }) {
            await this.init();
            return new Promise((resolve, reject) => {
                const req = State.db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME).get(path);
                // Return the content as is. It could be text or a Blob.
                req.onsuccess = e => resolve(e.target.result?.content ?? ''); 
                req.onerror = e => reject(e.target.error);
            });
        },
        write: async function({ path }, content) {
            await this.init();
            return new Promise((resolve, reject) => {
                const tx = State.db.transaction(this.STORE_NAME, "readwrite");
                const store = tx.objectStore(this.STORE_NAME);
                const req = store.get(path);
                req.onsuccess = () => {
                    const data = req.result || { path, isDir: false };
                    data.content = content;
                    store.put(data);
                };
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });
        },
        create: async function({ path }, name, kind) {
            await this.init();
            const newPath = path === '/' ? name : `${path}/${name}`;
            return new Promise((resolve, reject) => {
                const tx = State.db.transaction(this.STORE_NAME, "readwrite");
                tx.objectStore(this.STORE_NAME).put({ path: newPath, content: '', isDir: kind === 'directory' });
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });
        },
        delete: async function({ path, kind }) {
            await this.init();
            return new Promise((resolve, reject) => {
                const tx = State.db.transaction(this.STORE_NAME, "readwrite");
                const store = tx.objectStore(this.STORE_NAME);
                if (kind === 'directory') {
                    const range = IDBKeyRange.bound(path, path + '\uffff');
                    store.delete(range);
                } else {
                    store.delete(path);
                }
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });
        },
        // --- FIX ENDS HERE ---
    },
    GitHub: {
        // ... (GitHub implementation remains unchanged)
        api: async (endpoint, options = {}) => {
            if (!State.githubToken) throw new Error("GitHub token not set.");
            const headers = { 'Authorization': `Bearer ${State.githubToken}`, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...options.headers };
            const response = await fetch(`https://api.github.com${endpoint}`, { ...options, headers });
            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(err.message || `GitHub API Error: ${response.status}`);
            }
            return response.status === 204 ? null : response.json();
        },
        utf8_to_b64: str => btoa(unescape(encodeURIComponent(str))),
        b64_to_utf8: str => decodeURIComponent(escape(atob(str))),
        async list({ repoInfo, branch, path }) {
            const contents = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path === '/' ? '' : path}?ref=${branch}`);
            return contents.map(c => ({ 
                name: c.name, kind: c.type === 'dir' ? 'directory' : 'file', path: c.path, sha: c.sha
            }));
        },
        async read({ repoInfo, sha, name }) {
            const blob = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs/${sha}`);
            if (blob.encoding !== 'base64') throw new Error("Unsupported encoding from GitHub");

            const fileInfo = MimeUtil.getInfo(name);
            
            if (fileInfo.type === 'text') {
                return this.b64_to_utf8(blob.content);
            } else {
                // For binary files, return an object with the data needed to build a data URL.
                return {
                    isBinary: true,
                    base64Content: blob.content,
                    mime: fileInfo.mime
                };
            }
        },
        async write(item, content, commitMessage) {
            const { repoInfo, branch, path, name } = item;
            let existingSha;
            try {
                const fileData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${branch}`);
                existingSha = fileData.sha;
            } catch (e) { /* File doesn't exist, which is fine */ }

            const result = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    message: commitMessage || `B"H ${"\n"} updated ${name}!`, 
                    content: this.utf8_to_b64(content), sha: existingSha, branch 
                })
            });
            item.sha = result.content.sha;
        },
        async create({ repoInfo, branch, path }, name, kind) {
            const newPath = (path === '/' ? name : `${path}/${name}`) + (kind === 'directory' ? '/.gitkeep' : '');
            const message = `B"H${"\n"} create ${kind} '${name}'`;
            await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${newPath}`, {
                method: 'PUT',
                body: JSON.stringify({ message, content: kind === 'directory' ? '' : this.utf8_to_b64(''), branch })
            });
        },
        async delete({ repoInfo, branch, path, name, sha, kind }) {
            if (kind === 'directory') throw new Error("Deleting non-empty folders via API is complex and not supported in this version.");
            const message = `B"H${"\n"} delete ${name}`;
            await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`, {
                method: 'DELETE',
                body: JSON.stringify({ message, sha, branch })
            });
        }
    }
};
