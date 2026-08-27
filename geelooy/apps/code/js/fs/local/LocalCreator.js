
// B"H
/**
 * @file LocalCreator.js
 * @brief Manifests new files/folders directly onto the disk.
 */

import { LocalRoot } from './LocalRoot.js';
import { TraversalEngine } from './traversal-engine.js';
import { HandleCache } from './handle-cache.js';
import { MobileGuard } from './guard/MobileGuard.js';

export const LocalCreator = {
    /**
     * B"H
     * Summons a new file or directory into physical existence.
     * @param {Object} parent - The parent directory.
     * @param {string} name - The new name.
     * @param {string} kind - "file" or "directory"
     */
    async create(parent, name, kind) {
        const executor = async () => {
            const root = await LocalRoot.get(parent);
            let dir = HandleCache.get(parent.workspaceId, parent.path);
            
            try {
                if (!dir) dir = await TraversalEngine.walk(root, parent.path, { kind: 'directory' }, parent.workspaceId);
                let newHandle;
                if (kind === 'file') newHandle = await dir.getFileHandle(name, { create: true });
                else newHandle = await dir.getDirectoryHandle(name, { create: true });
                
                // Immediately Cache the newly born vessel
                HandleCache.set(parent.workspaceId, parent.path + '/' + name, newHandle);
            } catch (e) {
                HandleCache.remove(parent.workspaceId, parent.path);
                throw e;
            }
        };
        return await MobileGuard.execute(executor(), { ...parent, path: parent.path + '/' + name });
    }
};
