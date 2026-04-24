
// B"H
/**
 * @file traversal-engine.js
 * @brief Fully Memoized Seder Hishtalshelus of the File System.
 * 
 * THE BALLAD OF THE DESCENDING LIGHT:
 * From the root of the world, we begin the descent,
 * Through every segment where the handle is sent.
 * BUT WAIT! The Handle Cache stands at the door,
 * If the path is remembered, we search no more!
 * We instantly jump to the leaf of the tree,
 * Where the file is waiting for you and for me!
 */

import { HandleCache } from './handle-cache.js';

export const TraversalEngine = {
    /**
     * @async
     * @function walk
     * @description Navigates from a base directory handle down to a specific target path, utilizing aggressive caching.
     * @param {FileSystemDirectoryHandle} root - The starting directory.
     * @param {string} path - The coordinate to find.
     * @param {object} options - Configuration for the walk.
     * @param {string|number} wsId - The namespace for caching.
     * @param {boolean} ignoreCache - If true, forces a full physical re-walk.
     * @returns {Promise<FileSystemHandle>}
     */
    async walk(root, path, options = { kind: 'directory', create: false }, wsId, ignoreCache = false) {
        const safePath = path || "";
        const segments = safePath.split("/").filter(s => s !== "");
        let current = root;
        let accum = "";
        
        const cacheNamespace = wsId || root.name || 'anon_world';

        for (let i = 0; i < segments.length; i++) {
            const part = segments[i];
            accum += "/" + part;
            const isLast = (i === segments.length - 1);
            
            // Check RAM Cache FIRST for instant traversal
            if (!ignoreCache) {
                const cached = HandleCache.get(cacheNamespace, accum);
                if (cached) {
                    current = cached;
                    continue;
                }
            }

            if (isLast && options.kind === 'file') {
                current = await current.getFileHandle(part, { create: options.create });
            } else {
                current = await current.getDirectoryHandle(part, { create: options.create });
            }
            
            // Push newly discovered node to Lightning RAM cache
            HandleCache.set(cacheNamespace, accum, current);
        }
        return current;
    }
};
