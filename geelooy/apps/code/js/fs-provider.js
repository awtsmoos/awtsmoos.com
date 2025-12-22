/*B"H*/
// FILE: js/fs-provider.js

import { State } from './state.js';
import { LocalProvider } from './fs/local.js';
import { IndexedDBProvider } from './fs/indexeddb.js';
import { GitHubProvider } from './fs/github.js';
import { SSHProvider } from './fs/ssh.js';
import { OSFolderProvider } from './fs/os-folder.js';
import { PostMessageProvider } from './fs/post-message.js';
import { OPFSProvider } from './fs/opfs.js'; // B"H
import { ZipExplorer } from './zip/zip-explorer.js';

export const FileSystemProvider = {
    // Sub-modules
    Local: LocalProvider,
    IndexedDB: IndexedDBProvider,
    GitHub: GitHubProvider,
    SSH: SSHProvider,
    OSFolder: OSFolderProvider,
    PostMessage: PostMessageProvider,
    OPFS: OPFSProvider, // B"H

    async list(item) {
        try {
            switch (item.type) {
                case 'local': return this.Local.list(item);
                case 'ssh': return this.SSH.list(item);
                case 'indexeddb': return this.IndexedDB.list(item);
                case 'github': return this.GitHub.list(item);
                case 'osfolder': return this.OSFolder.list(item);
                case 'zip-entry': return ZipExplorer.fs.list(item);
                case 'opfs': return this.OPFS.list(item); // B"H
                default: throw new Error('Unsupported workspace type');
            }
        } catch (e) { console.error(`[FS LIST FAILED]`, e); throw e; }
    },
    
    async listAllFiles(item) {
        try {
            switch (item.type) {
                case 'local': return this.Local.listAllFiles(item);
                case 'indexeddb': return this.IndexedDB.listAllFiles(item);
                case 'github': return this.GitHub.listAllFiles(item); 
                case 'opfs': return this.OPFS.listAllFiles(item); // B"H
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
                case 'zip-entry': return ZipExplorer.fs.read(item);
                case 'opfs': return this.OPFS.read(item); // B"H
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
                case 'osfolder': return this.OSFolder.write(item, content);
                case 'zip-entry': return ZipExplorer.fs.write(item, content);
                case 'opfs': return this.OPFS.write(item, content); // B"H
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
                case 'osfolder': return this.OSFolder.create(parentDir, name, kind);
                case 'zip-entry': return ZipExplorer.fs.create(parentDir, name, kind);
                case 'opfs': return this.OPFS.create(parentDir, name, kind); // B"H
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
                case 'osfolder': return this.OSFolder.delete(item);
                case 'zip-entry': return ZipExplorer.fs.delete(item);
                case 'opfs': return this.OPFS.delete(item); // B"H
            }
        } catch (e) { console.error(`[FS DELETE FAILED]`, e); throw e; }
    },
    
    async rename(item, newName) {
        try {
            if (item.type === 'local') {
                return this.Local.rename(item, newName);
            }
            if (item.type === 'opfs') {
                return this.OPFS.rename(item, newName);
            }
            throw new Error(`Rename not supported for ${item.type} workspaces yet.`);
        } catch (e) {
            console.error("[FS RENAME FAILED]", e);
            throw e;
        }
    }
};