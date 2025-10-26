// B"H
// FILE: js/fs-provider.js

import { State } from './state.js';
import { MimeUtil } from './mime-util.js';
import { UI } from './ui.js';

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
    
    // B"H

    async listAllFiles(item) {
        try {
            switch (item.type) {
                case 'local': return this.Local.listAllFiles(item);
                case 'indexeddb': return this.IndexedDB.listAllFiles(item);
                // GitHub doesn't need this as we use the recursive tree API directly.
                default: throw new Error(`listAllFiles is not supported for type '${item.type}'`);
            }
        } catch (e) { console.error(`[FS LIST ALL FAILED]`, e); throw e; }
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

    // B"H

    Local: {
        /**
         * THIS IS THE NEW, ROBUST getHandle. This is the heart of the fix.
         * It correctly decodes paths and navigates step-by-step. The previous
         * versions likely had a subtle bug here causing the "not found" error.
         */
        async getHandle(rootHandle, path, { kind, create = false } = {}) {
            // Safety Check: If rootHandle is invalid, fail immediately.
            if (!rootHandle || typeof rootHandle.getDirectoryHandle !== 'function') {
                throw new Error("Invalid root directory handle provided to getHandle.");
            }

            let currentHandle = rootHandle;
            // The API cannot handle encoded characters like '%20' for spaces.
            // Decoding the path is absolutely essential for reliability.
            const decodedPath = decodeURIComponent(path);

            if (!decodedPath || decodedPath === '/') {
                return currentHandle;
            }
            
            const parts = decodedPath.split('/').filter(p => p && p !== '.');
            
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const isLast = i === parts.length - 1;

                if (isLast && kind === 'file') {
                    // Get the handle for the final file in the path.
                    currentHandle = await currentHandle.getFileHandle(part, { create });
                } else {
                    // Get the handle for the next directory in the path.
                    currentHandle = await currentHandle.getDirectoryHandle(part, { create });
                }
            }
            return currentHandle;
        },

        /**
         * THIS IS THE NEW, ROBUST list.
         * It guarantees that EVERY child object it returns contains the
         * original root 'handle', which is the key to all future operations.
         */
        async list({ handle, path }) {
            const dirHandle = await this.getHandle(handle, path);
            const entries = [];
            for await (const entry of dirHandle.values()) {
                entries.push({ 
                    handle: handle, // The critical fix: Pass the master key to every child.
                    name: entry.name, 
                    kind: entry.kind, 
                    path: `${path === '/' ? '' : path}/${entry.name}`
                });
            }
            return entries;
        },
        
        
        // B"H

        async listAllFiles({ handle, path }) {
            const allFiles = [];
            // Recursive helper function to traverse directories
            async function traverse(dirHandle, currentPath) {
                for await (const entry of dirHandle.values()) {
                    const newPath = `${currentPath}/${entry.name}`;
                    if (entry.kind === 'file') {
                        allFiles.push({
                            name: entry.name,
                            kind: 'file',
                            path: newPath
                        });
                    } else if (entry.kind === 'directory') {
                        await traverse(entry, newPath);
                    }
                }
            }
            const rootHandle = await this.getHandle(handle, path);
            await traverse(rootHandle, path === '/' ? '' : path);
            return allFiles;
        },
        
        

        /**
         * The 'read' method. It will now work because getHandle is correct.
         */
      

        // REPLACE your existing 'read' function with this one.
        async read({ handle, path }) {
            // --- THE FIX IS HERE ---
            // The Local File System API expects paths relative to the root handle.
            // Our app uses absolute paths like '/folder/file.js'.
            // This line safely removes the leading '/' if it exists, making both formats work.
            const relativePath = path.startsWith('/') ? path.substring(1) : path;
            // --- END FIX ---
            
            // The rest of the function now uses the corrected relativePath.
            const fileHandle = await this.getHandle(handle, relativePath, { kind: 'file' });
            return await fileHandle.getFile(); 
        },
        
        /**
         * The 'write' method. It will now work because getHandle is correct.
         */
        async write({ handle, path }, content) {
            // Get the file handle, creating the file if it doesn't exist.
            const fileHandle = await this.getHandle(handle, path, { kind: 'file', create: true });
            const writable = await fileHandle.createWritable();
            await writable.write({data: content});
            await writable.close();
        },

        /**
         * The 'create' method. It will now work because getHandle is correct.
         */
        async create({ handle, path }, name, kind) {
            const parentHandle = await this.getHandle(handle, path, { kind: 'directory' });
            if (kind === 'file') {
                await parentHandle.getFileHandle(name, { create: true });
            } else { // 'directory'
                await parentHandle.getDirectoryHandle(name, { create: true });
            }
        },
        
        /**
         * The 'delete' method. It will now work because getHandle is correct.
         */
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
        // B"H
	/*
	
	*   If an item's path is `'/Wow/all.html'`, it correctly calculates that its parent is `'/Wow'`.
*   If an item's path is `'/index.html'`, it correctly calculates that its parent is `'/'`.
*   If an item's path is `'Hey.html'` (an old file with no leading slash), it correctly calculates that its parent is `'/'`.

It then simply checks if the calculated parent path matches the `path` we are trying to list. This is a much more resilient and reliable method that will correctly handle all of your existing files while also working perfectly for all new files and folders you create.

	
	*/
	list: async function({ path }) {
            await this.init();
            return new Promise((resolve, reject) => {
                const store = State.db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
                const request = store.getAll();
                request.onerror = e => reject(e.target.error);
                request.onsuccess = () => {
                    const children = new Map();

                    request.result.forEach(item => {
                        // --- NEW BULLETPROOF LOGIC ---

                        // 1. Determine the parent path of the current item from the database.
                        // This handles both '/folder/file' and 'folder/file' formats.
                        const lastSlashIndex = item.path.lastIndexOf('/');
                        let parentPath = lastSlashIndex > 0 ? item.path.substring(0, lastSlashIndex) : '/';
                        if (lastSlashIndex === 0) { // This means the path is like '/file.html'
                            parentPath = '/';
                        } else if (lastSlashIndex === -1) { // This means the path is like 'file.html'
                            parentPath = '/'; // A file with no slashes belongs to the root.
                        }
                        
                        // 2. We have found a direct child if its calculated parent
                        //    path is the same as the path we are currently listing.
                        if (parentPath === path) {
                            const segment = item.path.substring(lastSlashIndex + 1);
                            
                            if (segment && !children.has(segment)) {
                                children.set(segment, { 
                                    name: segment, 
                                    kind: item.isDir ? 'directory' : 'file', 
                                    path: item.path // Always use the item's full, original path.
                                });
                            }
                        }
                        // --- END OF NEW LOGIC ---
                    });

                    resolve(Array.from(children.values()));
                };
            });
        },





// In the FileSystemProvider.IndexedDB object:
        listAllFiles: async function({ path }) {
            await this.init();
            return new Promise((resolve, reject) => {
                const store = State.db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
                const request = store.getAll();
                request.onerror = e => reject(e.target.error);
                request.onsuccess = () => {
                    // Filter for items within the specific workspace path that are files (not directories).
                    const dirPrefix = path === '/' ? '' : path + '/';
                    const files = request.result.filter(item => 
                        item.path.startsWith(dirPrefix) && item.path !== path && !item.isDir
                    );
                    resolve(files);
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
        // B"H
// FILE: js/fs-provider.js

// ... inside the FileSystemProvider.IndexedDB object ...

        // REPLACE your existing 'create' function with this one.
        create: async function({ path }, name, kind) {
            await this.init();
            
            // THE FIX: Ensure the new path is always correctly formed with a leading slash.
            const newPath = path === '/' ? `/${name}` : `${path}/${name}`;
            
            return new Promise((resolve, reject) => {
                const tx = State.db.transaction(this.STORE_NAME, "readwrite");
                const store = tx.objectStore(this.STORE_NAME);
                
                // When creating a file, its content should be an empty string, not undefined.
                const content = kind === 'directory' ? '' : ''; // Folders also get empty content for consistency
                
                store.put({ 
                    path: newPath, 
                    content: content, 
                    isDir: kind === 'directory' 
                });

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
    // B"H
// FILE: js/fs-provider.js

// ... inside the top-level FileSystemProvider object ...

    GitHub: {
        // --- YOUR ORIGINAL, WORKING METHODS (RESTORED) ---
        api: async (endpoint, options = {}) => {
            if (!State.githubToken) throw new Error("GitHub token not set.");
            const headers = {
             'Authorization': `Bearer ${State.githubToken}`, 
             'Accept': 'application/vnd.github+json', 
             'X-GitHub-Api-Version': '2022-11-28', 
             ...options.headers 
             };
             let fetchEndpoint = endpoint;
            const method = options.method || 'GET';
            if (method === 'GET') {
                const cacheBuster = `_cb=${Date.now()}`;
                fetchEndpoint += (fetchEndpoint.includes('?') ? '&' : '?') + cacheBuster;
            }
            const response = await fetch(`https://api.github.com${fetchEndpoint}`, { ...options, headers });
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
                return { isBinary: true, base64Content: blob.content, mime: fileInfo.mime };
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
                    message: commitMessage || `B"H\nupdated ${name}!`, 
                    content: this.utf8_to_b64(content), sha: existingSha, branch 
                })
            });
            item.sha = result.content.sha;
        },
        async create({ repoInfo, branch, path }, name, kind) {
            const newPath = (path === '/' ? name : `${path}/${name}`) + (kind === 'directory' ? '/.gitkeep' : '');
            const message = `B"H\ncreate ${kind} '${name}'`;
            await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${newPath}`, {
                method: 'PUT',
                body: JSON.stringify({ message, content: kind === 'directory' ? '' : this.utf8_to_b64(''), branch })
            });
        },
        
        async _deletePathRecursively(repoInfo, branch, path) {
            // 1. Get the list of items inside the folder. This call is correct.
            const contents = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${branch}`);
    
            // 2. Process all deletions SEQUENTIALLY to avoid race conditions.
            for (const item of contents) {
                UI.showLoading(`Deleting: ${item.path}`);
                if (item.type === 'file') {
                    // --- THE CRITICAL FIX ---
                    // The 'item' from the 'contents' API call already contains the 'sha' needed for deletion.
                    // We do NOT need to make another API call to get the blob content.
                    await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${item.path}`, {
                        method: 'DELETE',
                        body: JSON.stringify({ 
                            message: `B"H - Delete '${item.name}'`, 
                            sha: item.sha, // Use the SHA directly from the item
                            branch 
                        })
                    });
                    // --- END FIX ---
                } else if (item.type === 'dir') {
                    // Recurse into the subdirectory.
                    await this._deletePathRecursively(repoInfo, branch, item.path);
                }
            }
        },
    
        

    async delete(item) {
            const { repoInfo, branch, path, name } = item;
             
            if (item.kind === 'file') {
                const message = `B"H - Delete '${name}'`;
                // For a single file, we do need to get its SHA first.
                const fileData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${branch}`);
                await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`, {
                    method: 'DELETE',
                    body: JSON.stringify({ message, sha: fileData.sha, branch })
                });
            } else if (item.kind === 'directory') {
                // For a directory, we call our efficient recursive helper.
                await this._deletePathRecursively(repoInfo, branch, path);
            } else {
                throw new Error(`Unsupported item type for deletion: ${item.kind}`);
            }
        },
    async getLatestCommitSHA({ repoInfo, branch }) {
            const ref = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/ref/heads/${branch}`);
            return ref.object.sha;
        },
        async getFullTree({ repoInfo, branch }) {
            const latestCommitSHA = await this.getLatestCommitSHA({ repoInfo, branch });
            const treeData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${latestCommitSHA}?recursive=1`);
            
            // THE FIX: Return an object with both the tree and the SHA
            return {
                sha: latestCommitSHA,
                tree: treeData.tree.filter(node => node.type === 'blob')
            };
        },
        async commitMultipleFiles({ repoInfo, branch, commitMessage, changeSet }) {
            const latestCommitSHA = await this.getLatestCommitSHA({ repoInfo, branch });
            const latestCommit = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits/${latestCommitSHA}`);
            const baseTreeSHA = latestCommit.tree.sha;
            const filesToUpload = [...(changeSet.creations || []), ...(changeSet.updates || [])];
            const blobCreationPromises = filesToUpload.map(file => 
                this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs`, {
                    method: 'POST', body: JSON.stringify({ content: this.utf8_to_b64(file.content), encoding: 'base64' })
                }).then(blob => ({ path: file.path, sha: blob.sha }))
            );
            const createdBlobs = await Promise.all(blobCreationPromises);
            const tree = [];
            createdBlobs.forEach(blob => tree.push({ path: blob.path, mode: '100644', type: 'blob', sha: blob.sha }));
            (changeSet.deletions || []).forEach(file => tree.push({ path: file.path, mode: '100644', type: 'blob', sha: null }));
            const newTree = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
                method: 'POST', body: JSON.stringify({ base_tree: baseTreeSHA, tree: tree })
            });
            const newCommit = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
                method: 'POST', body: JSON.stringify({ message: commitMessage, tree: newTree.sha, parents: [latestCommitSHA] })
            });
            await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs/heads/${branch}`, {
                method: 'PATCH', body: JSON.stringify({ sha: newCommit.sha })
            });
            return newCommit.sha;
        }
    },

// ... continue with your Local and IndexedDB providers ...
    
    
    
    




    
};
