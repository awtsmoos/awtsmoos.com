
// B"H
/**
 * @file LocalLister.js
 * @brief Scans directories and proactively populates the RAM cache for instant future access.
 * 
 * THE NET OF ABUNDANCE:
 * When we open a folder to see what lies within,
 * We do not just read the names; we gather the handles in!
 * Every child we discover is cached instantly in RAM,
 * So the next time we write to them, there is no physical jam.
 * The Awtsmoos provides abundance before the need arises.
 */

import { LocalRoot } from './LocalRoot.js';
import { TraversalEngine } from './traversal-engine.js';
import { HandleCache } from './handle-cache.js';
import { MobileGuard } from './guard/MobileGuard.js';

export const LocalLister = {
    /**
     * B"H
     * Retrieves the contents of a directory and caches all child handles.
     * @param {Object} itemParams - The parent directory target.
     * @returns {Promise<Array<Object>>} List of child entries.
     */
    async list(itemParams) {
        const executor = async () => {
            const root = await LocalRoot.get(itemParams);
            let dir = HandleCache.get(itemParams.workspaceId, itemParams.path);
            
            try {
                if (!dir) dir = await TraversalEngine.walk(root, itemParams.path, { kind: 'directory' }, itemParams.workspaceId);
            } catch (e) {
                HandleCache.remove(itemParams.workspaceId, itemParams.path);
                dir = await TraversalEngine.walk(root, itemParams.path, { kind: 'directory' }, itemParams.workspaceId, true);
            }

            const entries = [];
            for await (const [name, entry] of dir.entries()) {
                const childPath = (itemParams.path === '/' ? '' : itemParams.path) + '/' + name;
                entries.push({ 
                    name, 
                    kind: entry.kind, 
                    path: childPath, 
                    workspaceId: itemParams.workspaceId 
                });
                // B"H - Proactively Cache the found children! Lightning fast access guaranteed later.
                HandleCache.set(itemParams.workspaceId, childPath, entry);
            }
            return entries;
        };
        return await MobileGuard.execute(executor(), itemParams);
    }
};
