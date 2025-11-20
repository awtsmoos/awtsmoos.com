/*B"H*/
// FILE: js/fs-provider.js

import { State } from './state.js';
import { MimeUtil } from './mime-util.js';
import { UI } from './ui.js';

/**
 * FileSystemProvider: A divine chariot, an abstraction layer that traverses the disparate realms 
 * of file systems—from the local machine's ephemeral memory to the persistent cloud of GitHub.
 */
export const FileSystemProvider = {
    async list(item) {
        try {
            switch (item.type) {
                case 'local': return this.Local.list(item);
                case 'ssh': return this.SSH.list(item);
                case 'indexeddb': return this.IndexedDB.list(item);
                case 'github': return this.GitHub.list(item);
                case 'osfolder': return this.OSFolder.list(item);
                default: throw new Error('Unsupported workspace type');
            }
        } catch (e) { console.error(`[FS LIST FAILED]`, e); throw e; }
    },
    
    async listAllFiles(item) {
        try {
            switch (item.type) {
                case 'local': return this.Local.listAllFiles(item);
                case 'indexeddb': return this.IndexedDB.listAllFiles(item);
                default: throw new Error(`listAllFiles is not supported for type '${item.type}'`);
            }
        } catch (e) { console.error(`[FS LIST ALL FAILED]`, e); throw e; }
    },
    
    async read(item) {
        try {
            switch (item.type) {
                case 'local': return this.Local.read(item);
                case 'ssh': return this.SSH.read(item);
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
                case 'ssh': return this.SSH.write(item, content);
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
                case 'ssh': return this.SSH.create(parentDir, name, kind);
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
                case 'ssh': return this.SSH.delete(item);
                case 'indexeddb': return this.IndexedDB.delete(item);
                case 'github': return this.GitHub.delete(item);
                case 'osfolder': return this.OSFolder. write(item, content);
            
            }
        } catch (e) { console.error(`[FS DELETE FAILED]`, e); throw e; }
    },

    Local: {
        async getHandle(rootHandle, path, { kind = 'directory', create = false } = {}) {
            let currentHandle = rootHandle;
            const decodedPath = decodeURIComponent(path).replace(/^\//, '');

            if (!decodedPath) {
                return rootHandle;
            }

            const parts = decodedPath.split('/');
            
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (!part) continue;

                const isLastPart = i === parts.length - 1;

                if (isLastPart && kind === 'file') {
                    currentHandle = await currentHandle.getFileHandle(part, { create });
                } else {
                    currentHandle = await currentHandle.getDirectoryHandle(part, { create });
                }
            }
            return currentHandle;
        },
        async list({ handle, path }) {
            const dirHandle = await this.getHandle(handle, path);
            const entries = [];
            for await (const entry of dirHandle.values()) {
                entries.push({ 
                    handle: handle,
                    name: entry.name, 
                    kind: entry.kind, 
                    path: `${path === '/' ? '' : path}/${entry.name}`
                });
            }
            return entries;
        },
        async listAllFiles({ handle, path }) {
            const allFiles = [];
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
        async read({ handle, path }) {
            const relativePath = path.startsWith('/') ? path.substring(1) : path;
            const fileHandle = await this.getHandle(handle, relativePath, { kind: 'file' });
            return await fileHandle.getFile(); 
        },
        async write(item, content) {
            const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
            if (!workspace) {
                throw new Error(`Critical error: Could not find the parent workspace for this file.`);
            }
            const performSaveOperation = async (handleToUse) => {
                const fileHandle = await this.getHandle(handleToUse, item.path, { kind: 'file', create: true });
                const writable = await fileHandle.createWritable();
                await writable.write({ type: 'write', data: content });
                await writable.close();
            };
            try {
                await performSaveOperation(workspace.handle);
            } catch (e) {
                if (e.message.includes('state had changed')) {
                    console.warn(`STALE HANDLE DETECTED for workspace "${workspace.name}". Initiating recovery.`);
                    UI.showToast("Workspace connection stale. Please re-select the folder to save.", "info", 6000);
                    try {
                        const newHandle = await window.showDirectoryPicker();
                        if (newHandle.name !== workspace.handle.name) {
                            throw new Error(`The selected folder "${newHandle.name}" does not match the workspace "${workspace.handle.name}".`);
                        }
                        workspace.handle = newHandle;
                        await new Promise(resolve => setTimeout(resolve, 50));
                        UI.showToast("Folder re-connected. Retrying save...", "success");
                        await performSaveOperation(workspace.handle);
                    } catch (recoveryError) {
                        let finalMessage;
                        if (recoveryError.name === 'AbortError') {
                            finalMessage = "Save was cancelled during folder re-selection.";
                            UI.showToast(finalMessage, "warning");
                        } else {
                            finalMessage = `The save failed even after recovery. Please try the save operation again.`;
                            console.error("CRITICAL: The recovery attempt failed.", recoveryError);
                            UI.showToast(finalMessage, "error", 10000);
                        }
                        throw new Error(finalMessage);
                    }
                } else {
                    throw e;
                }
            }
        },
        async create({ handle, path }, name, kind) {
            const parentHandle = await this.getHandle(handle, path, { kind: 'directory' });
            if (kind === 'file') {
                await parentHandle.getFileHandle(name, { create: true });
            } else {
                await parentHandle.getDirectoryHandle(name, { create: true });
            }
        },
        async delete({ handle, path }) {
            const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
            const name = path.substring(path.lastIndexOf('/') + 1);
            const parentHandle = await this.getHandle(handle, parentPath);
            await parentHandle.removeEntry(name, { recursive: true });
        }
    },

    /*B"H*/
IndexedDB: {
    DB_NAME: "VIVID_X_FS_PROFOUND",
    GIT_DB_NAME: "VIVID_X_GIT_CHANGES_PROFOUND", // Our new, separate database.
    STORE_NAME: "files",
    GIT_STORE_NAME: "uncommitted_files", // The single store in our new database.

    /**
     * @private
     * @description A robust, reusable function to open an IndexedDB database.
     * It handles success, error, upgrade, and the critical 'blocked' state.
     */
    _openDb: function(dbName, version, onUpgradeNeeded) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, version);

            // This is the critical new event handler that prevents silent freezes.
            request.onblocked = () => {
                reject(new Error(
                    `Database connection is blocked. Please close any other open tabs with this application and refresh the page.`
                ));
            };

            request.onupgradeneeded = onUpgradeNeeded;
            request.onsuccess = e => resolve(e.target.result);
            request.onerror = e => reject(e.target.error);
        });
    },

    /**
     * @private
     * @description Initializes the main database for "Browser Storage".
     */
    _initMainDB: async function() {
        if (State.db) return State.db;
        State.db = await this._openDb(this.DB_NAME, 1, e => {
            e.target.result.createObjectStore(this.STORE_NAME, { keyPath: "path" });
        });
        return State.db;
    },

    /**
     * @private
     * @description Initializes the separate database for GitHub changes.
     */
    _initGitDB: async function() {
        if (State.gitDb) return State.gitDb;
        State.gitDb = await this._openDb(this.GIT_DB_NAME, 1, e => {
            e.target.result.createObjectStore(this.GIT_STORE_NAME, { keyPath: "uniquePath" });
        });
        return State.gitDb;
    },

    /**
     * @public
     * @description Initializes connections to BOTH databases concurrently.
     */
    init: async function() {
        await Promise.all([this._initMainDB(), this._initGitDB()]);
    },

    // --- Methods for the MAIN "Browser Storage" Database ---

    list: async function({ path }) {
        await this._initMainDB();
        return new Promise((resolve, reject) => {
            const store = State.db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
            const request = store.getAll();
            request.onerror = e => reject(e.target.error);
            request.onsuccess = () => {
                const children = new Map();
                request.result.forEach(item => {
                    const lastSlashIndex = item.path.lastIndexOf('/');
                    let parentPath = lastSlashIndex > 0 ? item.path.substring(0, lastSlashIndex) : '/';
                    if (lastSlashIndex === 0 || lastSlashIndex === -1) { parentPath = '/'; }
                    if (parentPath === path) {
                        const segment = item.path.substring(lastSlashIndex + 1);
                        if (segment && !children.has(segment)) {
                            children.set(segment, { name: segment, kind: item.isDir ? 'directory' : 'file', path: item.path });
                        }
                    }
                });
                resolve(Array.from(children.values()));
            };
        });
    },
    read: async function({ path }) {
        await this._initMainDB();
        return new Promise((resolve, reject) => {
            const store = State.db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
            const request = store.get(path);
            request.onerror = e => reject(e.target.error);
            request.onsuccess = e => {
                if (e.target.result !== undefined) { resolve(e.target.result.content); } 
                else { reject(new Error(`File not found in Browser Storage at path: "${path}"`)); }
            };
        });
    },
    write: async function({ path }, content) {
        await this._initMainDB();
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
        await this._initMainDB();
        const newPath = path === '/' ? `/${name}` : `${path}/${name}`;
        return new Promise((resolve, reject) => {
            const tx = State.db.transaction(this.STORE_NAME, "readwrite");
            const store = tx.objectStore(this.STORE_NAME);
            store.put({ path: newPath, content: '', isDir: kind === 'directory' });
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    },
    delete: async function({ path, kind }) {
        await this._initMainDB();
        return new Promise((resolve, reject) => {
            const tx = State.db.transaction(this.STORE_NAME, "readwrite");
            const store = tx.objectStore(this.STORE_NAME);
            if (kind === 'directory') {
                store.delete(IDBKeyRange.bound(path, path + '\uffff'));
            } else {
                store.delete(path);
            }
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    },
    listAllFiles: async function({ path }) {
        await this._initMainDB();
        return new Promise((resolve, reject) => {
            const store = State.db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
            const request = store.getAll();
            request.onerror = e => reject(e.target.error);
            request.onsuccess = () => {
                const dirPrefix = path === '/' ? '' : path + '/';
                resolve(request.result.filter(item => item.path.startsWith(dirPrefix) && item.path !== path && !item.isDir));
            };
        });
    },
    
    // --- Methods for the NEW "Git Changes" Database ---
    readUncommitted: async function(uniquePath) {
        await this._initGitDB();
        return new Promise((resolve, reject) => {
            const store = State.gitDb.transaction(this.GIT_STORE_NAME).objectStore(this.GIT_STORE_NAME);
            const request = store.get(uniquePath);
            request.onerror = e => reject(e.target.error);
            request.onsuccess = e => e.target.result ? resolve(e.target.result.content) : reject(new Error("No uncommitted version found."));
        });
    },
    writeUncommitted: async function(uniquePath, content, item) {
        await this._initGitDB();
        return new Promise((resolve, reject) => {
            const tx = State.gitDb.transaction(this.GIT_STORE_NAME, "readwrite");
            tx.objectStore(this.GIT_STORE_NAME).put({ uniquePath, content, item });
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    },
    deleteUncommitted: async function(uniquePath) {
        await this._initGitDB();
        return new Promise((resolve, reject) => {
            const tx = State.gitDb.transaction(this.GIT_STORE_NAME, "readwrite");
            tx.objectStore(this.GIT_STORE_NAME).delete(uniquePath);
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    },
    listUncommittedForWorkspace: async function(workspaceId) {
        await this._initGitDB();
        return new Promise((resolve, reject) => {
            const store = State.gitDb.transaction(this.GIT_STORE_NAME).objectStore(this.GIT_STORE_NAME);
            const request = store.getAll();
            request.onerror = e => reject(e.target.error);
            request.onsuccess = () => resolve(request.result.filter(entry => entry.uniquePath.startsWith(`${workspaceId}::`)));
        });
    },
},
    
    GitHub: {
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
            const contents = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${branch}`);
            for (const item of contents) {
                UI.showLoading(`Deleting: ${item.path}`);
                if (item.type === 'file') {
                    await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${item.path}`, {
                        method: 'DELETE',
                        body: JSON.stringify({ 
                            message: `B"H - Delete '${item.name}'`, 
                            sha: item.sha,
                            branch 
                        })
                    });
                } else if (item.type === 'dir') {
                    await this._deletePathRecursively(repoInfo, branch, item.path);
                }
            }
        },
        async delete(item) {
            const { repoInfo, branch, path, name } = item;
            if (item.kind === 'file') {
                const message = `B"H - Delete '${name}'`;
                const fileData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${branch}`);
                await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`, {
                    method: 'DELETE',
                    body: JSON.stringify({ message, sha: fileData.sha, branch })
                });
            } else if (item.kind === 'directory') {
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
    
	PostMessage: {
	    async read(item) {
	        return item.content || ''; 
	    },
	    async write(item, content) {
	        return new Promise((resolve, reject) => {
	            window.parent.postMessage({
	                type: 'saveFile',
	                payload: {
	                    content: content,
	                    saveContext: item.saveContext
	                }
	            }, '*');
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
	 
		var kind = name => name.endsWith('.folder') ? 'directory' : 'file';
		
		var realName = name => kind(name) == "directory" ?
			name.substring(
				0,
				name.indexOf(".folder")
			) : name;
		if(kind == "directory") {
			realName  = name.substring(0, f);
		}
	        // Step 5: Map the response. For each child item the OS returns,
	        // we construct its full path so the editor can work with it for subsequent actions.
	        return response.items.map(name => ({
	            name: realName(name),
	            kind:kind(name),
	            // The path for the child is its parent's full path plus its own name.
	            path: `${pathForOSRequest}/${realName(name)}`
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
	
	
	SSH: {
	    // A helper to make API calls to your Node.js server
	    async _api(endpoint, sshInfo, body) {
	        const { host, user } = sshInfo;
	        const url = `/api/ssh/${endpoint}/${encodeURIComponent(user)}/${encodeURIComponent(host)}`;
	        
	        const formData = new URLSearchParams();
	        
	        // This logic sends the correct credential to the API
	        if (sshInfo.authMethod === 'password' && sshInfo.password) {
	            formData.append('password', atob(sshInfo.password));
	        } else if (sshInfo.authMethod === 'pem' && sshInfo.pem) {
	            // This part is for if you add PEM support back later
	            // The current Node.js code doesn't use it, but it's good to have.
	            formData.append('pem', sshInfo.pem); 
	        } else {
	            throw new Error("Missing credentials for SSH request.");
	        }
	
	        for (const key in body) {
	            formData.append(key, body[key]);
	        }
	
	        const response = await fetch(url, {
	            method: 'POST',
	            body: formData
	        });
	
	        if (!response.ok) {
	            throw new Error(`API Error: ${response.statusText}`);
	        }
	        
	        const result = await response.json();
	        if (!result.success) {
	            throw new Error(result.message || 'An unknown error occurred on the server.');
	        }
	        return result;
	    },
	
	    async list(item) {
	        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
	        const fullPath = (workspace.sshInfo.initialPath + (item.path === '/' ? '' : item.path)).replace(/\/+/g, '/');
	        const result = await this._api('getFolderList', workspace.sshInfo, { folderPath: fullPath });
	        return result.files.map(file => ({
	            name: file.name,
	            kind: file.kind,
	            path: (item.path === '/' ? '' : item.path) + '/' + file.name
	        }));
	    },
	
	    async read(item) {
	        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
	        const fullPath = (workspace.sshInfo.initialPath + item.path).replace(/\/+/g, '/');
	        const result = await this._api('getFileContent', workspace.sshInfo, { filePath: fullPath });
	        return result.content;
	    },
	
	    async write(item, content) {
	        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
	        const fullPath = (workspace.sshInfo.initialPath + item.path).replace(/\/+/g, '/');
	        await this._api('writeFile', workspace.sshInfo, { filePath: fullPath, content: content });
	    },
	
	    async create(parentDir, name, kind) {
	        const workspace = State.workspaces.find(ws => ws.id === parentDir.workspaceId);
	        const parentFullPath = (workspace.sshInfo.initialPath + (parentDir.path === '/' ? '' : parentDir.path)).replace(/\/+/g, '/');
	        const newFullPath = `${parentFullPath}/${name}`;
	
	        if (kind === 'directory') {
	            await this._api('makeFolder', workspace.sshInfo, { folderPath: newFullPath });
	        } else {
	            await this._api('writeFile', workspace.sshInfo, { filePath: newFullPath, content: '' });
	        }
	    },
	
	    async delete(item) {
	        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
	        const fullPath = (workspace.sshInfo.initialPath + item.path).replace(/\/+/g, '/');
	        await this._api('deleteAtPath', workspace.sshInfo, { deletePath: fullPath });
	    }
	},






    
};
