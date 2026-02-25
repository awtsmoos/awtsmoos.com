/* B"H */
// FILE: js/fs-provider.js

import { State } from './state.js';
import { LocalProvider } from './fs/local.js';
import { IndexedDBProvider } from './fs/indexeddb.js';
import { GitHubProvider } from './fs/github.js';
import { SSHProvider } from './fs/ssh.js';
import { OSFolderProvider } from './fs/os-folder.js';
import { PostMessageProvider } from './fs/post-message.js';
import { OPFSProvider } from './fs/opfs.js';
import { ZipExplorer } from './zip/zip-explorer.js';

export const FileSystemProvider = {
    Local: LocalProvider,
    IndexedDB: IndexedDBProvider,
    GitHub: GitHubProvider,
    SSH: SSHProvider,
    OSFolder: OSFolderProvider,
    PostMessage: PostMessageProvider,
    OPFS: OPFSProvider,

    async list(item) {
        try {
            // B"H - Determine the true underlying physical type of the item.
            const type = item.originalType || item.type;
            let result;

            switch (type) {
                case 'local': result = await this.Local.list(item); break;
                case 'ssh': result = await this.SSH.list(item); break;
                case 'indexeddb': result = await this.IndexedDB.list(item); break;
                case 'github': result = await this.GitHub.list(item); break;
                case 'osfolder': result = await this.OSFolder.list(item); break;
                case 'zip-entry': result = await ZipExplorer.fs.list(item); break;
                case 'opfs': result = await this.OPFS.list(item); break;
                case 'postmessage': result = { entries: [], isGitRoot: false }; break;
                default: throw new Error(`Unsupported workspace type: '${type}'`);
            }
            
            let children = [];
            let isGitRoot = false;

            // B"H - ABSOLUTE RECTIFICATION: Safe extraction to avoid Array.prototype.entries traps.
            if (Array.isArray(result)) {
                children = result; // Direct array returned by Local/GitHub providers
            } else if (result && Array.isArray(result.entries)) {
                children = result.entries; // Object format returned by some custom providers
                isGitRoot = !!result.isGitRoot;
            } else {
                children = []; // Safe fallback
            }

            // Ensure isGitRoot is true if the specific folder contains the metadata directory
            isGitRoot = isGitRoot || children.some(c => c && c.name === '.awtsmoos-repo');

            return { entries: children, isGitRoot };
            
        } catch (e) { 
            // B"H - Silent rejection for "Not Found" during internal checks
            // This prevents noisy logs when LoopEngine checks if a directory exists yet.
            if (e.name === 'NotFoundError' || (e.message && e.message.toLowerCase().includes('not found'))) {
                throw e; 
            }
            
            // For all other errors, log loudly for debugging.
            console.error(`[FS LIST FAILED] Fatal error listing item '${item.path}' in workspace type '${item.originalType || item.type}'. Full Error:`, e); 
            throw e; 
        }
    },
    
    async listAllFiles(item) {
        try {
            const type = item.originalType || item.type;
            switch (type) {
                case 'local': return this.Local.listAllFiles(item);
                case 'indexeddb': return this.IndexedDB.listAllFiles(item);
                case 'github': return this.GitHub.getFullTree(item).then(res => res.tree.filter(n => n.type === 'blob')); 
                case 'opfs': return this.OPFS.listAllFiles(item);
                default: throw new Error(`listAllFiles is not supported for type '${type}'`);
            }
        } catch (e) { 
            console.error(`[FS LIST ALL FAILED] Fatal error.`, e); 
            throw e; 
        }
    },
    
    async read(item) {
        try {
            const type = item.originalType || item.type;
            switch (type) {
                case 'local': return this.Local.read(item);
                case 'ssh': return this.SSH.read(item);
                case 'indexeddb': return this.IndexedDB.read(item);
                case 'github': return this.GitHub.read(item);
                case 'postmessage': return this.PostMessage.read(item);
                case 'osfolder': return this.OSFolder.read(item);
                case 'zip-entry': return ZipExplorer.fs.read(item);
                case 'opfs': return this.OPFS.read(item);
                default: throw new Error(`Read not supported for type '${type}'`);
            }
        } catch (e) { 
            console.error(`[FS READ FAILED] Cannot read '${item.path}'.`, e); 
            throw e; 
        }
    },
    
    async write(item, content, commitMessage) {
        try {
            const type = item.originalType || item.type;
            switch (type) {
                case 'local': return this.Local.write(item, content);
                case 'ssh': return this.SSH.write(item, content);
                case 'indexeddb': return this.IndexedDB.write(item, content);
                case 'github': return this.GitHub.write(item, content, commitMessage);
                case 'postmessage': return this.PostMessage.write(item, content);
                case 'osfolder': return this.OSFolder.write(item, content);
                case 'zip-entry': return ZipExplorer.fs.write(item, content);
                case 'opfs': return this.OPFS.write(item, content);
                default: throw new Error(`Write not supported for type '${type}'`);
            }
        } catch (e) { 
            // We do not catch and swallow here so LoopEngine can intercept NotFoundError and retry.
            throw e; 
        }
    },
    
    async create(parentDir, name, kind) {
        try {
            const type = parentDir.originalType || parentDir.type;
            switch (type) {
                case 'local': return this.Local.create(parentDir, name, kind);
                case 'ssh': return this.SSH.create(parentDir, name, kind);
                case 'indexeddb': return this.IndexedDB.create(parentDir, name, kind);
                case 'github': return this.GitHub.create(parentDir, name, kind);
                case 'osfolder': return this.OSFolder.create(parentDir, name, kind);
                case 'zip-entry': return ZipExplorer.fs.create(parentDir, name, kind);
                case 'opfs': return this.OPFS.create(parentDir, name, kind);
                default: throw new Error(`Create not supported for type '${type}'`);
            }
        } catch (e) { 
            console.error(`[FS CREATE FAILED] Cannot create '${name}' in '${parentDir.path}'.`, e); 
            throw e; 
        }
    },
    
    async delete(item) {
        try {
            const type = item.originalType || item.type;
            switch (type) {
                case 'local': return this.Local.delete(item);
                case 'ssh': return this.SSH.delete(item);
                case 'indexeddb': return this.IndexedDB.delete(item);
                case 'github': return this.GitHub.delete(item);
                case 'osfolder': return this.OSFolder.delete(item);
                case 'zip-entry': return ZipExplorer.fs.delete(item);
                case 'opfs': return this.OPFS.delete(item);
                default: throw new Error(`Delete not supported for type '${type}'`);
            }
        } catch (e) { 
            // Do not swallow, let LoopEngine handle expected NotFound errors
            throw e; 
        }
    },
    
    async rename(item, newName) {
        try {
            const type = item.originalType || item.type;
            if (type === 'local') {
                return this.Local.rename(item, newName);
            }
            if (type === 'opfs') {
                return this.OPFS.rename(item, newName);
            }
            throw new Error(`Rename not supported for ${type} workspaces yet.`);
        } catch (e) {
            console.error(`[FS RENAME FAILED] Cannot rename '${item.path}' to '${newName}'.`, e);
            throw e;
        }
    }
};