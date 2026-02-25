
// B"H
// FILE: js/fs/indexeddb.js
import { State } from '../state.js';

/**
 * @class IndexedDBProvider
 * @classdesc The deep vessel of persistent memory.
 * 
 * THE POEM OF THE ARCHIVE:
 * What is written in the mind can be forgotten,
 * But what is written in the stone of IndexedDB remains.
 * This module manages the 'workspace_handles' store, where
 * the absolute keys to the user's local projects are kept.
 * 
 * RECTIFICATION:
 * We now guard the threshold. No invalid key shall pass.
 * By ensuring the Workspace ID is present before we seek its form,
 * we prevent the chaos of the 'DataError' from manifestion.
 */
export const IndexedDBProvider = {
    DB_NAME: "VIVID_X_FS_PROFOUND",
    STORE_NAME: "files",
    GIT_STORE_NAME: "uncommitted_files",
    HANDLE_STORE: "workspace_handles",

    /**
     * @function init
     * @description Establishes the connection to the database vessels.
     */
    init: function() {
        return new Promise((resolve, reject) => {
            if (State.db) return resolve(State.db);

            const request = indexedDB.open(this.DB_NAME, 3);

            request.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: "path" });
                }
                if (!db.objectStoreNames.contains(this.GIT_STORE_NAME)) {
                    db.createObjectStore(this.GIT_STORE_NAME, { keyPath: "uniquePath" });
                }
                if (!db.objectStoreNames.contains(this.HANDLE_STORE)) {
                    db.createObjectStore(this.HANDLE_STORE); 
                }
            };

            request.onsuccess = e => {
                State.db = e.target.result;
                State.gitDb = e.target.result; 
                resolve(State.db);
            };

            request.onerror = e => reject(e.target.error);
        });
    },

    /**
     * @async
     * @function saveHandle
     * @description Inscribes a FileSystemHandle into the database.
     * B"H - Added guard against null/undefined workspaceId.
     */
    saveHandle: async function(workspaceId, handle) {
        if (workspaceId === undefined || workspaceId === null) {
            console.warn("B\"H: Attempted to save handle with no ID. Operation aborted.");
            return;
        }
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.HANDLE_STORE, "readwrite");
            const store = tx.objectStore(this.HANDLE_STORE);
            store.put(handle, workspaceId);
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    },

    /**
     * @async
     * @function getHandle
     * @description Retrieves a FileSystemHandle by its Workspace ID.
     * B"H - THE CRITICAL RECTIFICATION: 
     * We check if the key exists before calling the database. 
     * This prevents the DataError: No key specified.
     */
    getHandle: async function(workspaceId) {
        if (workspaceId === undefined || workspaceId === null) {
            return null; // Return peace instead of error.
        }
        
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.HANDLE_STORE, "readonly");
            const store = tx.objectStore(this.HANDLE_STORE);
            
            try {
                const request = store.get(workspaceId);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            } catch (e) {
                // Final shield against non-serializable or invalid keys.
                resolve(null);
            }
        });
    },

    // --- Standard Filesystem Methods ---
    list: async function({ path }) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const store = db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                const children = new Map();
                const pathWithSlash = path.endsWith('/') ? path : `${path}/`;
                const pathIsRoot = path === '/';
                request.result.forEach(item => {
                    if (item.path.startsWith(pathWithSlash) || (pathIsRoot && item.path.startsWith('/'))) {
                        const relativePath = pathIsRoot ? item.path.substring(1) : item.path.substring(pathWithSlash.length);
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
            request.onsuccess = e => {
                if (e.target.result !== undefined) resolve(e.target.result.content);
                else reject(new Error(`File not found: "${path}"`));
            };
        });
    },

    write: async function({ path }, content) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, "readwrite");
            tx.objectStore(this.STORE_NAME).put({ path, content, isDir: false });
            tx.oncomplete = resolve;
        });
    },

    create: async function({ path }, name, kind) {
        const db = await this.init();
        const newPath = path === '/' ? `/${name}` : `${path}/${name}`;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, "readwrite");
            tx.objectStore(this.STORE_NAME).put({ path: newPath, content: (kind === 'file' ? '' : null), isDir: kind === 'directory' });
            tx.oncomplete = resolve;
        });
    },

    delete: async function({ path, kind }) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, "readwrite");
            const store = tx.objectStore(this.STORE_NAME);
            if (kind === 'directory') {
                const request = store.openCursor(IDBKeyRange.lowerBound(path));
                request.onsuccess = e => {
                    const cursor = e.target.result;
                    if (cursor) {
                        if (cursor.key === path || cursor.key.startsWith(`${path}/`)) store.delete(cursor.key);
                        cursor.continue();
                    }
                };
            } else store.delete(path);
            tx.oncomplete = resolve;
        });
    },

    listAllFiles: async function({ path }) {
        const db = await this.init();
        return new Promise((resolve) => {
            const store = db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                const dirPrefix = path === '/' ? '' : path + '/';
                resolve(request.result.filter(item => item.path.startsWith(dirPrefix) && item.path !== path && !item.isDir));
            };
        });
    },
    
    // --- Git Staging Methods ---
    readUncommitted: async function(uniquePath) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const store = db.transaction(this.GIT_STORE_NAME).objectStore(this.GIT_STORE_NAME);
            const request = store.get(uniquePath);
            request.onsuccess = e => e.target.result ? resolve(e.target.result.content) : reject(new Error("No uncommitted data."));
        });
    },
    writeUncommitted: async function(uniquePath, content, item) {
        const db = await this.init();
        return new Promise((resolve) => {
            const tx = db.transaction(this.GIT_STORE_NAME, "readwrite");
            tx.objectStore(this.GIT_STORE_NAME).put({ uniquePath, content, item });
            tx.oncomplete = resolve;
        });
    },
    deleteUncommitted: async function(uniquePath) {
        const db = await this.init();
        return new Promise((resolve) => {
            const tx = db.transaction(this.GIT_STORE_NAME, "readwrite");
            tx.objectStore(this.GIT_STORE_NAME).delete(uniquePath);
            tx.oncomplete = resolve;
        });
    },
    listUncommittedForWorkspace: async function(workspaceId) {
        const db = await this.init();
        return new Promise((resolve) => {
            const store = db.transaction(this.GIT_STORE_NAME).objectStore(this.GIT_STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result.filter(entry => entry.uniquePath.startsWith(`${workspaceId}::`)));
        });
    }
};
