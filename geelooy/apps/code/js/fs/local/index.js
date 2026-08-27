
// B"H
/**
 * @file index.js
 * @brief Modularized facade for the Local Filesystem.
 */

import { LocalRoot } from './LocalRoot.js';
import { LocalReader } from './LocalReader.js';
import { LocalWriter } from './LocalWriter.js';
import { LocalLister } from './LocalLister.js';
import { LocalCreator } from './LocalCreator.js';
import { LocalDeleter } from './LocalDeleter.js';
import { LocalFastCopier } from './LocalFastCopier.js';

export const LocalProvider = {
    _getRootHandle: (item) => LocalRoot.get(item),
    
    async getHandle(root, path, options = {}, wsId) {
        const { TraversalEngine } = await import('./traversal-engine.js');
        return await TraversalEngine.walk(root, path, options, wsId);
    },

    read: (item) => LocalReader.read(item),
    write: (item, content, msg, onStatus) => LocalWriter.write(item, content, onStatus), // B"H Forward callback
    list: (item) => LocalLister.list(item),
    create: (parent, name, kind) => LocalCreator.create(parent, name, kind),
    delete: (item) => LocalDeleter.delete(item),
    fastCopy: (src, destHandle, onProg) => LocalFastCopier.fastCopy(src, destHandle, onProg)
};
