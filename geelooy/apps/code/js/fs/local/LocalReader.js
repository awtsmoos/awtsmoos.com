
// B"H
/**
 * @file LocalReader.js
 * @brief Reads physical files securely and instantly via cache.
 * 
 * THE POEM OF THE REVEALED ESSENCE:
 * We peer into the depth of the disk, looking for the spark.
 * If the RAM remembers the handle, we skip the heavy dark!
 * Straight to the File object, we pull the essence out,
 * Leaving all latency and performance lag in doubt.
 */

import { LocalRoot } from './LocalRoot.js';
import { TraversalEngine } from './traversal-engine.js';
import { HandleCache } from './handle-cache.js';
import { MobileGuard } from './guard/MobileGuard.js';

export const LocalReader = {
    /**
     * B"H
     * Reads the physical file from the local or OPFS system.
     * @param {Object} item - The file object holding coordinates.
     * @returns {Promise<File>} A Browser File object containing the blob essence.
     */
    async read(item) {
        const executor = async () => {
            const root = await LocalRoot.get(item);
            let handle = HandleCache.get(item.workspaceId, item.path);
            
            try {
                if (!handle) {
                    handle = await TraversalEngine.walk(root, item.path, { kind: 'file' }, item.workspaceId);
                }
                return await handle.getFile();
            } catch (e) {
                // If cache is stale or OS locked it behind our back
                if (e.name === 'NotFoundError' || e.name === 'NotAllowedError') {
                    HandleCache.remove(item.workspaceId, item.path);
                    handle = await TraversalEngine.walk(root, item.path, { kind: 'file' }, item.workspaceId, true);
                    return await handle.getFile();
                }
                throw e;
            }
        };
        return await MobileGuard.execute(executor(), item);
    }
};
