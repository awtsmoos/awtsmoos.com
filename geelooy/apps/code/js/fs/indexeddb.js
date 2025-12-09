// B"H
// FILE: js/fs/indexeddb.js
import { State } from '../state.js';

export const IndexedDBProvider = {
    DB_NAME: "VIVID_X_FS_PROFOUND",
    STORE_NAME: "files",
    GIT_STORE_NAME: "uncommitted_files",

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

    create: async function({ path }, name, kind) {
        const db = await this.init();
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

    delete: async function({ path, kind }) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, "readwrite");
            const store = tx.objectStore(this.STORE_NAME);

            if (kind === 'directory') {
                const range = IDBKeyRange.lowerBound(path);
                const request = store.openCursor(range);
                const pathsToDelete = [];
                
                request.onsuccess = e => {
                    const cursor = e.target.result;
                    if (cursor) {
                        if (cursor.key === path || cursor.key.startsWith(`${path}/`)) {
                            pathsToDelete.push(cursor.key);
                        }
                        cursor.continue();
                    } else {
                        pathsToDelete.forEach(p => store.delete(p));
                    }
                };
            } else {
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
};
