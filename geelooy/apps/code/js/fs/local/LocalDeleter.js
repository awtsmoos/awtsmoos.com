
// B"H
/**
 * @file LocalDeleter.js
 * @brief Returns a vessel back to the potential of the void.
 */

import { LocalRoot } from './LocalRoot.js';
import { TraversalEngine } from './traversal-engine.js';
import { HandleCache } from './handle-cache.js';
import { MobileGuard } from './guard/MobileGuard.js';

export const LocalDeleter = {
    /**
     * B"H
     * Vaporizes the target file or directory recursively.
     * @param {Object} item - The coordinate to destroy.
     */
    async delete(item) {
        const executor = async () => {
            const root = await LocalRoot.get(item);
            const parts = item.path.split('/').filter(Boolean);
            const name = parts.pop();
            const parentP = '/' + parts.join('/');
            
            let dir = HandleCache.get(item.workspaceId, parentP);
            try {
                if (!dir) dir = await TraversalEngine.walk(root, parentP, { kind: 'directory' }, item.workspaceId);
                await dir.removeEntry(name, { recursive: true });
                
                // B"H - Purge the shattered vessel from Memory
                HandleCache.remove(item.workspaceId, item.path);
            } catch (e) {
                HandleCache.remove(item.workspaceId, parentP);
                throw e;
            }
        };
        return await MobileGuard.execute(executor(), item);
    }
};
