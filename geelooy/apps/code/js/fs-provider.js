
// B"H
// FILE: js/fs-provider.js

import { ProviderStrategies } from './fs-provider/strategies.js';

/**
 * @class FileSystemProvider
 * @description The Supreme Facade. 
 * 
 * THE POEM OF THE GATEKEEPER:
 * Who shall enter the chambers of the Disk?
 * Only he who carries the seal of the Workspace.
 * This gatekeeper verifies the identity (type) 
 * and selects the strategy from the holy Map.
 * It prevents the 'Undefined' shadow from entering,
 * ensuring every operation is anchored in a known world.
 */
export const FileSystemProvider = {
    // Expose strategies for deep access
    ...ProviderStrategies,

    /**
     * @function _execute
     * @description B"H. The core engine of delegation. 
     * It extracts the strategy and executes the willed ritual.
     */
    async _execute(method, item, ...args) {
        const type = item.originalType || item.type;
        const worker = ProviderStrategies[type];

        if (!worker) {
            console.error(`%c[FS ERROR] B"H - Identification failure for ${item.path}`, "color: red; font-weight: bold;", item);
            throw new Error(`The world type '${type}' has no manifested strategy.`);
        }

        if (typeof worker[method] !== 'function') {
            throw new Error(`The world of ${type} does not support the '${method}' ritual.`);
        }

        console.log(`[FS_EXEC] B"H - ${method} on ${item.path} [${type}]`);
        return await worker[method](item, ...args);
    },

    /**
     * @async
     * @function list
     * @description Reveals the hidden sparks within a directory vessel.
     */
    async list(item) {
        const result = await this._execute('list', item);
        const children = Array.isArray(result) ? result : (result.entries || []);
        let isGitRoot = result && typeof result === 'object' ? !!result.isGitRoot : false;
        isGitRoot = isGitRoot || children.some(c => c && c.name === '.awtsmoos-repo');
        return { entries: children, isGitRoot };
    },

    async read(item) { return await this._execute('read', item); },

    async write(item, content, commitMessage) { 
        return await this._execute('write', item, content, commitMessage); 
    },

    async create(parentDir, name, kind) {
        return await this._execute('create', parentDir, name, kind);
    },

    async delete(item) {
        return await this._execute('delete', item);
    },

    async listAllFiles(item) {
        const type = item.originalType || item.type;
        const handlers = {
            local: () => this.Local.listAllFiles(item),
            indexeddb: () => this.IndexedDB.listAllFiles(item),
            github: () => this.GitHub.getFullTree(item).then(res => res.tree.filter(n => n.type === 'blob')),
            opfs: () => this.OPFS.listAllFiles(item)
        };
        const fn = handlers[type];
        if (!fn) throw new Error(`Deep scan not supported for ${type}`);
        return await fn();
    }
};
