
// B"H
// FILE: js/fs-provider.js

import { ProviderStrategies } from './fs-provider/strategies.js';

export const FileSystemProvider = {
    ...ProviderStrategies,

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

        return await worker[method](item, ...args);
    },

    async list(item) {
        const result = await this._execute('list', item);
        const children = Array.isArray(result) ? result : (result.entries ||[]);
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
        const worker = ProviderStrategies[type];
        
        // Use optimized native method if it exists
        if (worker && typeof worker.listAllFiles === 'function') {
            return await worker.listAllFiles(item);
        }
        
        // B"H - Universal Recursive Fallback for ALL other workspace types
        const allFiles =[];
        const traverse = async (currentItem) => {
            try {
                const res = await this.list(currentItem);
                const children = res.entries ||[];
                for (const child of children) {
                    if (child.name === '.awtsmoos-repo' || child.name === '.git' || child.name === 'node_modules') continue;
                    
                    const childPath = (currentItem.path === '/' ? '' : currentItem.path) + '/' + child.name;
                    const fullChild = { ...currentItem, ...child, path: childPath };
                    
                    if (child.kind === 'directory') {
                        await traverse(fullChild);
                    } else {
                        allFiles.push(fullChild);
                    }
                }
            } catch (e) {
                console.warn(`[FS] Failed to scan directory ${currentItem.path}`, e);
            }
        };
        
        await traverse(item);
        return allFiles;
    }
};
