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

    /*B"H*/
    Local: {
        // Helper to find the root handle if the item handle is missing
        _getRootHandle(item) {
            if (item.handle) return item.handle; // Use existing if available
            
            // If missing (e.g. after refresh), find the workspace
            const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
            if (!workspace) throw new Error(`Workspace not found for item: ${item.name}`);
            if (!workspace.handle) throw new Error(`Workspace '${workspace.name}' is not connected (Locked or Lost).`);
            
            return workspace.handle;
        },

        async getHandle(rootHandle, path, { kind = 'directory', create = false } = {}) {
            let currentHandle = rootHandle;
            const decodedPath = decodeURIComponent(path).replace(/^\//, '');

            if (!decodedPath) return rootHandle;

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

        async list({ handle, path, workspaceId }) { // Accept workspaceId
            // Logic to ensure we have a handle
            const root = handle || (State.workspaces.find(w => w.id === workspaceId)?.handle);
            if (!root) throw new Error("No handle available for listing");

            const dirHandle = await this.getHandle(root, path);
            const entries = [];
            for await (const entry of dirHandle.values()) {
                entries.push({ 
                    handle: root, // Propagate the root handle
                    name: entry.name, 
                    kind: entry.kind, 
                    path: `${path === '/' ? '' : path}/${entry.name}`,
                    workspaceId: workspaceId // Ensure ID is passed down
                });
            }
            return entries;
        },

        async listAllFiles(item) {
            const root = this._getRootHandle(item);
            const allFiles = [];
            
            // Recursive traverse function
            const traverse = async (dirHandle, currentPath) => {
                for await (const entry of dirHandle.values()) {
                    const newPath = `${currentPath}/${entry.name}`;
                    if (entry.kind === 'file') {
                        allFiles.push({
                            name: entry.name,
                            kind: 'file',
                            path: newPath,
                            workspaceId: item.workspaceId // Pass ID
                        });
                    } else if (entry.kind === 'directory') {
                        await traverse(entry, newPath);
                    }
                }
            };
            
            const targetHandle = await this.getHandle(root, item.path);
            await traverse(targetHandle, item.path === '/' ? '' : item.path);
            return allFiles;
        },

        async read(item) {
            const root = this._getRootHandle(item);
            const relativePath = item.path.startsWith('/') ? item.path.substring(1) : item.path;
            const fileHandle = await this.getHandle(root, relativePath, { kind: 'file' });
            return await fileHandle.getFile(); 
        },

        async write(item, content) {
            // Find workspace to verify connection and get handle
            const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
            if (!workspace) throw new Error(`Critical error: Parent workspace not found.`);
            
            const performSave = async (rootHandle) => {
                const fileHandle = await this.getHandle(rootHandle, item.path, { kind: 'file', create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(content);
                await writable.close();
            };

            try {
                // Try with the workspace's current handle
                await performSave(workspace.handle);
            } catch (e) {
                // If the handle is stale (e.g., browser security change), try to recover
                if (e.name === 'NotAllowedError' || e.message.includes('state had changed')) {
                    console.warn(`Stale handle for "${workspace.name}". Requesting permission/re-select.`);
                    
                    // If it's just a permission lock, this might fix it?
                    // Usually write requires 'readwrite' permission specifically.
                    if ((await workspace.handle.queryPermission({mode:'readwrite'})) !== 'granted') {
                        await workspace.handle.requestPermission({mode:'readwrite'});
                        // Retry immediately after permission grant
                        await performSave(workspace.handle);
                        return;
                    }
                }
                throw e;
            }
        },

        async create(parentDir, name, kind) {
            const root = this._getRootHandle(parentDir);
            const parentHandle = await this.getHandle(root, parentDir.path, { kind: 'directory' });
            if (kind === 'file') {
                await parentHandle.getFileHandle(name, { create: true });
            } else {
                await parentHandle.getDirectoryHandle(name, { create: true });
            }
        },

        async delete(item) {
            const root = this._getRootHandle(item);
            const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
            const name = item.path.substring(item.path.lastIndexOf('/') + 1);
            const parentHandle = await this.getHandle(root, parentPath);
            await parentHandle.removeEntry(name, { recursive: true });
        }
    },

    /*B"H*/
IndexedDB: {
    DB_NAME: "VIVID_X_FS_PROFOUND",
    STORE_NAME: "files",
    GIT_STORE_NAME: "uncommitted_files",

    /*B"H*/

/**
 * Initializes the connection to the browser's eternal memory (IndexedDB).
 * Version bumped to 3 to create the new 'workspace_handles' vessel.
 * This vessel holds the sacred keys (Handles) that allow us to return to
 * local folders after the page has passed into the void and returned (refreshed).
 */
init: function() {
    return new Promise((resolve, reject) => {
        if (State.db) return resolve(State.db);

        // We open version 3 to trigger an upgrade for existing users.
        const request = indexedDB.open(this.DB_NAME, 3);

        request.onupgradeneeded = e => {
            const db = e.target.result;
            
            if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                db.createObjectStore(this.STORE_NAME, { keyPath: "path" });
            }
            if (!db.objectStoreNames.contains(this.GIT_STORE_NAME)) {
                db.createObjectStore(this.GIT_STORE_NAME, { keyPath: "uniquePath" });
            }
            
            // NEW: The vessel for holding local directory handles.
            // We use the Workspace ID as the key.
            if (!db.objectStoreNames.contains("workspace_handles")) {
                db.createObjectStore("workspace_handles"); 
            }
        };

        request.onsuccess = e => {
            State.db = e.target.result;
            State.gitDb = e.target.result; 
            resolve(State.db);
        };

        request.onerror = e => reject(e.target.error);
        request.onblocked = () => reject(new Error("Database connection is blocked. Please close other open tabs."));
    });
},

/**
 * Inscribes a directory handle into the 'workspace_handles' store.
 * This anchors the user's local folder to a persistent ID, allowing
 * resurrection of the workspace upon reload.
 * @param {number} workspaceId - The unique identifier of the workspace.
 * @param {FileSystemDirectoryHandle} handle - The browser's handle object.
 */
saveHandle: async function(workspaceId, handle) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("workspace_handles", "readwrite");
        const store = tx.objectStore("workspace_handles");
        store.put(handle, workspaceId);
        
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
},

/**
 * Retrieves a directory handle from the deep storage.
 * Used during the initialization sequence to restore access to a local folder.
 * @param {number} workspaceId - The unique identifier of the workspace.
 * @returns {Promise<FileSystemDirectoryHandle|undefined>} The handle, if found.
 */
getHandle: async function(workspaceId) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("workspace_handles", "readonly");
        const store = tx.objectStore("workspace_handles");
        const request = store.get(workspaceId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
},

    // --- Methods for the MAIN "Browser Storage" ---
/*B"H*/
/**
 * Lists the children of a given directory path within the browser's storage.
 * This corrected version uses a more robust algorithm to calculate the parent
 * of each item, fixing the bug that prevented sub-directories from expanding.
 * @param {object} item - The directory item whose children are to be listed.
 * @param {string} item.path - The path of the directory (e.g., '/', '/my-folder').
 * @returns {Promise<object[]>} A promise that resolves with an array of child items.
 */
list: async function({ path }) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
        const store = db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
        const request = store.getAll();
        request.onerror = e => reject(e.target.error);
        request.onsuccess = () => {
            const children = new Map();
            const pathWithSlash = path.endsWith('/') ? path : `${path}/`;
            const pathIsRoot = path === '/';

            request.result.forEach(item => {
                // Ensure the item path is a direct child of the target path.
                if (item.path.startsWith(pathWithSlash) || (pathIsRoot && item.path.startsWith('/'))) {
                    // Find the part of the path *after* the parent path.
                    const relativePath = pathIsRoot ? item.path.substring(1) : item.path.substring(pathWithSlash.length);
                    
                    // If there are no more slashes, it's a direct child.
                    if (relativePath && !relativePath.includes('/')) {
                        children.set(relativePath, { name: relativePath, kind: item.isDir ? 'directory' : 'file', path: item.path });
                    }
                }
            });
            resolve(Array.from(children.values()));
        };
    });
},
    read: async function({ path }) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const store = db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
            const request = store.get(path);
            request.onerror = e => reject(e.target.error);
            request.onsuccess = e => {
                if (e.target.result !== undefined) resolve(e.target.result.content);
                else reject(new Error(`File not found in Browser Storage at path: "${path}"`));
            };
        });
    },
    write: async function({ path }, content) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, "readwrite");
            const store = tx.objectStore(this.STORE_NAME);
            store.put({ path, content, isDir: false }); // Simplified assumption for write
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    },
    /*B"H*/

/**
 * Creates a new file or directory in the browser's storage. This corrected version
 * uses a more direct and robust method for path construction, ensuring that creating
 * items in sub-directories is always successful.
 * @param {object} parentDir - The directory item where the new item will be created.
 * @param {string} name - The name of the new file or folder.
 * @param {string} kind - Either 'file' or 'directory'.
 * @returns {Promise<void>} A promise that resolves when the creation is complete.
 */
create: async function({ path }, name, kind) {
    const db = await this.init();
    // This new path construction is simpler and avoids potential edge cases.
    // If the parent path is the root '/', it creates '/name'.
    // Otherwise, it creates '/parent/path/name'.
    const newPath = path === '/' ? `/${name}` : `${path}/${name}`;
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.put({ path: newPath, content: (kind === 'file' ? '' : null), isDir: kind === 'directory' });
        
        request.onerror = () => reject(request.error);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
},
    /*B"H*/

/**
 * Deletes an item from the browser's storage. This corrected version handles
 * directory deletion more robustly by explicitly finding and deleting all
 * descendants before removing the directory record itself, preventing errors.
 * @param {object} item - The file or folder item to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
delete: async function({ path, kind }) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        const store = tx.objectStore(this.STORE_NAME);

        if (kind === 'directory') {
            // A more robust way to delete a directory and all its contents.
            const range = IDBKeyRange.lowerBound(path);
            const request = store.openCursor(range);
            const pathsToDelete = [];
            
            request.onsuccess = e => {
                const cursor = e.target.result;
                if (cursor) {
                    // Check if the key is the directory itself or a path inside it.
                    if (cursor.key === path || cursor.key.startsWith(`${path}/`)) {
                        pathsToDelete.push(cursor.key);
                    }
                    cursor.continue();
                } else {
                    // Once we have all paths, delete them.
                    pathsToDelete.forEach(p => store.delete(p));
                }
            };
        } else {
            // For a single file, the operation is simple.
            store.delete(path);
        }

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
},
    listAllFiles: async function({ path }) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const store = db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
            const request = store.getAll();
            request.onerror = e => reject(e.target.error);
            request.onsuccess = () => {
                const dirPrefix = path === '/' ? '' : path + '/';
                resolve(request.result.filter(item => item.path.startsWith(dirPrefix) && item.path !== path && !item.isDir));
            };
        });
    },
    
    // --- Methods for the "Git Changes" store ---

    readUncommitted: async function(uniquePath) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const store = db.transaction(this.GIT_STORE_NAME).objectStore(this.GIT_STORE_NAME);
            const request = store.get(uniquePath);
            request.onerror = e => reject(e.target.error);
            request.onsuccess = e => e.target.result ? resolve(e.target.result.content) : reject(new Error("No uncommitted version found."));
        });
    },
    writeUncommitted: async function(uniquePath, content, item) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.GIT_STORE_NAME, "readwrite");
            tx.objectStore(this.GIT_STORE_NAME).put({ uniquePath, content, item });
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    },
    deleteUncommitted: async function(uniquePath) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.GIT_STORE_NAME, "readwrite");
            tx.objectStore(this.GIT_STORE_NAME).delete(uniquePath);
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    },
    listUncommittedForWorkspace: async function(workspaceId) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const store = db.transaction(this.GIT_STORE_NAME).objectStore(this.GIT_STORE_NAME);
            const request = store.getAll();
            request.onerror = e => reject(e.target.error);
            request.onsuccess = () => resolve(request.result.filter(entry => entry.uniquePath.startsWith(`${workspaceId}::`)));
        });
    },
},
    
    GitHub: {
        /*B"H*/

/**
 * A universal conduit to the GitHub API. This corrected version understands
 * that to gaze upon public works (GET requests), one does not need a key (token).
 * It now speaks with the proper tone for both public and private realms.
 * @param {string} endpoint - The API endpoint to call, e.g., '/user/repos'.
 * @param {object} [options={}] - Standard fetch options (method, body, etc.).
 * @returns {Promise<object|null>} The JSON response from the API.
 */
api: async (endpoint, options = {}) => {
    const method = options.method || 'GET';
    const headers = {
     'Accept': 'application/vnd.github+json', 
     'X-GitHub-Api-Version': '2022-11-28', 
     ...options.headers 
    };

    // Only add the Authorization header if a token exists.
    // This allows unauthenticated GET requests for public repositories.
    if (State.githubToken) {
        headers['Authorization'] = `Bearer ${State.githubToken}`;
    } else if (method !== 'GET') {
        // If we don't have a token, we cannot perform actions that change data.
        throw new Error("A GitHub token is required for this action.");
    }
     
    let fetchEndpoint = endpoint;
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
        /*B"H*/


async read(item) {
            // This function can be called in two contexts:
            // 1. Reading a file from a direct 'github' workspace.
            // 2. Reading a file from a remote repo as part of a 'pull' operation for a local clone.
            
            // We prioritize using the repoInfo directly attached to the item.
            // This is correct for 'pull' operations, where a temporary item is constructed.
            let repoInfo = item.repoInfo;
            const { sha, name } = item;

            // If the item doesn't have repoInfo directly (e.g., it's just a file from a direct GitHub workspace),
            // we fall back to looking up the parent workspace's repoInfo.
            if (!repoInfo) {
                const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
                if (workspace && workspace.repoInfo) {
                    repoInfo = workspace.repoInfo;
                }
            }

            // If after both checks we still don't have what we need, then we throw an error.
            if (!repoInfo) {
                throw new Error(`Could not determine repository information for this read operation.`);
            }

            // If, for any reason, the sha is still invalid, this check provides a clear error.
            if (!sha) {
                throw new Error(`Cannot read file "${name}": its SHA identifier is missing.`);
            }

            const blob = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs/${sha}`);
            
            if (blob.encoding !== 'base64') throw new Error("Unsupported encoding from GitHub");
            const fileInfo = MimeUtil.getInfo(name);
            if (fileInfo.type === 'text') {
                return this.b64_to_utf8(blob.content);
            } else {
                return { isBinary: true, base64Content: blob.content, mime: fileInfo.mime };
            }
        },
        /**
 * Writes or updates a file in a GitHub repository.
 * After the operation, it invalidates the workspace's tree cache.
 * @param {object} item - The file item to write to.
 * @param {string} content - The string content to write.
 * @param {string} [commitMessage] - The commit message for the operation.
 * @returns {Promise<void>}
 */
async write(item, content, commitMessage) {
    const {
        repoInfo,
        branch,
        path,
        name
    } = item;
    let existingSha;
    try {
        const fileData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${branch}`);
        existingSha = fileData.sha;
    } catch (e) { /* File doesn't exist, which is fine */ }

    const result = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify({
            message: commitMessage || `B"H\nupdated ${name}!`,
            content: this.utf8_to_b64(content),
            sha: existingSha,
            branch
        })
    });
    item.sha = result.content.sha;

    const workspace = State.workspaces.find(ws => ws.repoInfo?.repo === repoInfo.repo && ws.repoInfo?.owner === repoInfo.owner);
    if (workspace) workspace._treeCache = null;
},
        /**
 * Creates a new file or directory in a GitHub repository.
 * After the operation, it invalidates the workspace's tree cache.
 * @param {object} parentDir - The directory where the item will be created.
 * @param {string} name - The name of the new file or folder.
 * @param {string} kind - The type of item to create ('file' or 'directory').
 * @returns {Promise<void>}
 */
async create({
    repoInfo,
    branch,
    path
}, name, kind) {
    const newPath = (path === '/' ? name : `${path}/${name}`) + (kind === 'directory' ? '/.gitkeep' : '');
    const message = `B"H\ncreate ${kind} '${name}'`;
    await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${newPath}`, {
        method: 'PUT',
        body: JSON.stringify({
            message,
            content: kind === 'directory' ? '' : this.utf8_to_b64(''),
            branch
        })
    });

    const workspace = State.workspaces.find(ws => ws.repoInfo?.repo === repoInfo.repo && ws.repoInfo?.owner === repoInfo.owner);
    if (workspace) workspace._treeCache = null;
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
        /**
 * Deletes a file or directory from a GitHub repository.
 * After the operation, it invalidates the workspace's tree cache.
 * @param {object} item - The item to delete.
 * @returns {Promise<void>}
 */
async delete(item) {
    const {
        repoInfo,
        branch,
        path,
        name
    } = item;
    if (item.kind === 'file') {
        const message = `B"H - Delete '${name}'`;
        const fileData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${branch}`);
        await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`, {
            method: 'DELETE',
            body: JSON.stringify({
                message,
                sha: fileData.sha,
                branch
            })
        });
    } else if (item.kind === 'directory') {
        await this._deletePathRecursively(repoInfo, branch, path);
    } else {
        throw new Error(`Unsupported item type for deletion: ${item.kind}`);
    }

    const workspace = State.workspaces.find(ws => ws.repoInfo?.repo === repoInfo.repo && ws.repoInfo?.owner === repoInfo.owner);
    if (workspace) workspace._treeCache = null;
},
        /*B"H*/

/**
 * Fetches the SHA of the most recent commit on a given branch. This new version
 * understands the nature of the void; if the branch does not exist (as in an empty
 * repository), it does not panic. It gracefully catches the error and returns null,
 * signaling to the caller that this realm is pristine and without history.
 * @param {object} params - The repository information.
 * @returns {Promise<string|null>} The SHA of the latest commit, or null if none exists.
 */
async getLatestCommitSHA({ repoInfo, branch }) {
    try {
        const ref = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/ref/heads/${branch}`);
        return ref.object.sha;
    } catch (e) {
        // If the error is a "Not Found" or similar, it's an empty repo. This is not an error for us.
        if (e.message.toLowerCase().includes('not found') || e.message.toLowerCase().includes('empty')) {
            return null; // A sign of a pristine, empty repository.
        }
        // For any other error (like authentication), we must still throw it.
        throw e;
    }
},


/*B"H*/

/**
 * Fetches the entire file blueprint of a repository. This corrected version no longer
 * filters the result, returning the complete tree of both files ('blobs') and the
 * directories ('trees') that contain them. This provides the rendering engine with
 * the full context needed to build its memory-map in a single, enlightened pass.
 * @param {object} params - The repository information.
 * @returns {Promise<object>} An object with the commit SHA (or null) and the complete tree.
 */
async getFullTree({ repoInfo, branch }) {
    const latestCommitSHA = await this.getLatestCommitSHA({ repoInfo, branch });

    if (latestCommitSHA === null) {
        return { sha: null, tree: [] };
    }

    const treeData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${latestCommitSHA}?recursive=1`);
    
    // THE FIX: We return the entire tree, not just the files. The directories are essential.
    return {
        sha: latestCommitSHA,
        tree: treeData.tree 
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
