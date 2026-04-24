// B"H
import { ProviderStrategies } from './fs-provider/strategies.js';

export const FileSystemProvider = {
    ...ProviderStrategies,

    async _execute(method, item, ...args) {
        const type = item.originalType || item.type;
        const worker = ProviderStrategies[type];

        if (!worker) throw new Error(`The world type '${type}' has no strategy.`);
        if (typeof worker[method] !== 'function') {
            throw new Error(`The world of ${type} does not support '${method}'.`);
        }
        return await worker[method](item, ...args);
    },

    async list(item) {
        const result = await this._execute('list', item);
        const children = Array.isArray(result) ? result : (result.entries || []);
        const isGitRoot = children.some(c => c && c.name === '.awtsmoos-repo');
        return { entries: children, isGitRoot };
    },

    async read(item) { return await this._execute('read', item); },
    async write(item, content, msg, onStatus) { 
        return await this._execute('write', item, content, msg, onStatus); 
    },
    async create(parentDir, name, kind) { return await this._execute('create', parentDir, name, kind); },
    async delete(item) { return await this._execute('delete', item); },

    async listAllFiles(item) {
        const allFiles = [];
        const traverse = async (currentItem) => {
            try {
                const res = await this.list(currentItem);
                for (const child of res.entries) {
                    if (['.git', 'node_modules', '.awtsmoos-repo'].includes(child.name)) continue;
                    const childPath = (currentItem.path === '/' ? '' : currentItem.path) + '/' + child.name;
                    const fullChild = { ...currentItem, ...child, path: childPath };
                    if (child.kind === 'directory') await traverse(fullChild);
                    else allFiles.push(fullChild);
                }
            } catch (e) {}
        };
        await traverse(item);
        return allFiles;
    }
};