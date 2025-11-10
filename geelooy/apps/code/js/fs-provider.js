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
                case 'osfolder': return this.OSFolder.list(item);
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
                case 'postmessage': return this.PostMessage.read(item);
                case 'osfolder': return this.OSFolder.read(item);
            }
        } catch (e) { console.error(`[FS READ FAILED]`, e); throw e; }
    },
    async write(item, content, commitMessage) {
        try {
            switch (item.type) {
                case 'local': return this.Local.write(item, content);
                case 'indexeddb': return this.IndexedDB.write(item, content);
                case 'github': return this.GitHub.write(item, content, commitMessage);
                case 'postmessage': return this.PostMessage.write(item, content);
                case 'osfolder': return this.OSFolder. write(item, content);
            
            }
        } catch (e) { console.error(`[FS WRITE FAILED]`, e); throw e; }
    },
    async create(parentDir, name, kind) {
        try {
            switch (parentDir.type) {
                case 'local': return this.Local.create(parentDir, name, kind);
                case 'indexeddb': return this.IndexedDB.create(parentDir, name, kind);
                case 'github': return this.GitHub.create(parentDir, name, kind);
                case 'osfolder': return this.OSFolder. create(parentDir, name, kind);
            }
        } catch (e) { console.error(`[FS CREATE FAILED]`, e); throw e; }
    },
    async delete(item) {
        try {
            switch (item.type) {
                case 'local': return this.Local.delete(item);
                case 'indexeddb': return this.IndexedDB.delete(item);
                case 'github': return this.GitHub.delete(item);
                case 'osfolder': return this.OSFolder. write(item, content);
            
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
        

async getHandle(rootHandle, path, { kind = 'directory', create = false } = {}) {
    let currentHandle = rootHandle;
    // The API works with paths relative to the root, so we decode and remove any leading slash.
    const decodedPath = decodeURIComponent(path).replace(/^\//, '');

    if (!decodedPath) {
        return rootHandle; // Return the root if the path is empty.
    }

    const parts = decodedPath.split('/');
    
    // Loop through each part of the path.
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue; // Skip empty parts from accidental double slashes.

        const isLastPart = i === parts.length - 1;

        if (isLastPart && kind === 'file') {
            // For the final part, if it's a file, get the file handle.
            // The 'create' flag here will create the file if it doesn't exist.
            currentHandle = await currentHandle.getFileHandle(part, { create });
        } else {
            // For any directory part, get the directory handle.
            // The 'create' flag here ensures intermediate directories are created on demand.
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

async write(item, content) {
    const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
    if (!workspace) {
        throw new Error(`Critical error: Could not find the parent workspace for this file.`);
    }

    // A small, self-contained function to perform the save.
    const performSaveOperation = async (handleToUse) => {
        const fileHandle = await this.getHandle(handleToUse, item.path, { kind: 'file', create: true });
        const writable = await fileHandle.createWritable();
        await writable.write({ type: 'write', data: content });
        await writable.close();
    };

    try {
        // --- ATTEMPT 1: Try to save with the current handle. ---
        await performSaveOperation(workspace.handle);

    } catch (e) {
        // --- FAILURE DETECTED: Check if it's our specific recoverable error. ---
        if (e.message.includes('state had changed')) {
            console.warn(`STALE HANDLE DETECTED for workspace "${workspace.name}". Initiating recovery.`);
            UI.showToast("Workspace connection stale. Please re-select the folder to save.", "info", 6000);

            try {
                // 1. Get a BRAND NEW handle from the user.
                const newHandle = await window.showDirectoryPicker();

                // 2. Verify the user selected the correct folder.
                if (newHandle.name !== workspace.handle.name) {
                    throw new Error(`The selected folder "${newHandle.name}" does not match the workspace "${workspace.handle.name}".`);
                }

                // 3. Update the central state with the new, valid handle.
                workspace.handle = newHandle;
                
                // 4. THE DEFINITIVE FIX: Yield to the browser's event loop.
                // We wait for an imperceptible 50 milliseconds. This gives the browser's
                // internal file system state manager enough time to fully process the
                // new handle we just received, preventing the race condition.
                await new Promise(resolve => setTimeout(resolve, 50));

                UI.showToast("Folder re-connected. Retrying save...", "success");

                // 5. --- ATTEMPT 2: Retry the save. It will now use the settled, new handle. ---
                await performSaveOperation(workspace.handle);

            } catch (recoveryError) {
                // This block catches failures during the recovery process itself.
                let finalMessage;
                if (recoveryError.name === 'AbortError') {
                    finalMessage = "Save was cancelled during folder re-selection.";
                    UI.showToast(finalMessage, "warning");
                } else {
                    finalMessage = `The save failed even after recovery. Please try the save operation again.`;
                    console.error("CRITICAL: The recovery attempt failed.", recoveryError);
                    UI.showToast(finalMessage, "error", 10000);
                }
                // Throw a new, clear error to the main UI.
                throw new Error(finalMessage);
            }
        } else {
            // If the initial error was something else, throw it immediately.
            throw e;
        }
    }
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
        
        // In: js/fs-provider.js -> FileSystemProvider.IndexedDB

read: async function({ path }) {
    await this.init();
    return new Promise((resolve, reject) => {
        const store = State.db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
        const request = store.get(path);

        request.onerror = e => reject(e.target.error);
        
        request.onsuccess = e => {
            const result = e.target.result;
            if (result !== undefined) {
                // Success: The file was found. Resolve with its content.
                resolve(result.content);
            } else {
                // Failure: The file was not in the database. Reject with a clear error.
                reject(new Error(`File not found in Browser Storage at path: "${path}"`));
            }
        };
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
    
    
    
    // In fs-provider.js, add this new provider object
PostMessage: {
    // We don't need to read, as the content is provided on load.
    async read(item) {
        console.log("PostMessage Provider: Read called, but content is pre-loaded.");
        return item.content || ''; 
    },

    // This is the crucial part: it sends the save command to the OS.
    async write(item, content) {
        return new Promise((resolve, reject) => {
            console.log("PostMessage Provider: Sending save request to OS.", { item, content });
            
            // The OS will listen for this specific message type
            window.parent.postMessage({
                type: 'saveFile',
                payload: {
                    content: content,
                    saveContext: item.saveContext // The OS-specific path info
                }
            }, '*'); // Use a specific origin in production

            // Listen for a success/error response from the OS
            const responseListener = (event) => {
                if (event.data.type === 'saveSuccess') {
                    window.removeEventListener('message', responseListener);
                    resolve();
                } else if (event.data.type === 'saveError') {
                    window.removeEventListener('message', responseListener);
                    reject(new Error(event.data.error));
                }
            };
            window.addEventListener('message', responseListener);
        });
    },

    // These operations are not supported in this mode, as the OS handles them.
    async list(item) { throw new Error('File listing is not supported in embedded mode.'); },
    async create(parentDir, name, kind) { throw new Error('File creation is not supported in embedded mode.'); },
    async delete(item) { throw new Error('File deletion is not supported in embedded mode.'); }
},





    



OSFolder: {
    // Helper function to send a request and wait for a response
    _requestFromOS(type, payload) {
        return new Promise((resolve, reject) => {
            const requestId = State.postMessageRequestId++;
            State.postMessagePendingRequests.set(requestId, { resolve, reject });
            
            window.parent.postMessage({ type, payload, requestId }, '*');
            
            setTimeout(() => {
                if (State.postMessagePendingRequests.has(requestId)) {
                    State.postMessagePendingRequests.delete(requestId);
                    reject(new Error(`Request timed out: ${type}`));
                }
            }, 10000);
        });
    },
    
    // --- THIS IS THE CORRECTED FUNCTION ---
    async list(item) {
        // Step 1: Find the corresponding workspace in the state using the workspaceId.
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);

        // Safety check: If we can't find the workspace, we can't proceed.
        if (!workspace || workspace.type !== 'osfolder') {
            console.error("OSFolder provider could not find a valid workspace for item:", item);
            throw new Error("Could not find OS folder workspace.");
        }

        // Step 2: Get the REAL base path from the workspace object.
        // This is the crucial link, e.g., "desktop.folder/add from new chabad library.folder"
        const basePath = workspace.path;

        // Step 3: Translate the editor's path into the OS's absolute path.
        // If the editor asks for the root ('/'), we use the basePath.
        // If it asks for a sub-path like '/folderA', we append it to the basePath.
        const pathForOSRequest = basePath + (item.path === '/' ? '' : item.path);

        // Step 4: Make the request to the OS using the true, fully-qualified path.
        const response = await this._requestFromOS('requestFolderList', { path: pathForOSRequest });

        // Step 5: Map the response. For each child item the OS returns,
        // we construct its full path so the editor can work with it for subsequent actions.
        return response.items.map(name => ({
            name,
            kind: name.endsWith('.folder') ? 'directory' : 'file',
            // The path for the child is its parent's full path plus its own name.
            path: `${pathForOSRequest}/${name}`
        }));
    },

    async read(item) {
        const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));
        const response = await this._requestFromOS('requestFileContent', { path: parentPath, fileName: item.name });
        return response.content;
    },
    
    async write(item, content) {
   
        await this._requestFromOS('requestFileWrite', {
            fullPath: item.path,
            content: content
        });
    },

    async create(parentDir, name, kind) {
        await this._requestFromOS('requestItemCreate', {
            parentPath: parentDir.path,
            name: name,
            kind: kind
        });
    },
    
    async delete(item) {
         await this._requestFromOS('requestItemDelete', {
            fullPath: item.path,
            kind: item.kind
        });
    }
},






    
};
