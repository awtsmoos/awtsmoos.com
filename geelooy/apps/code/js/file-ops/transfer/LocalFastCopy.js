
// B"H
/**
 * @file LocalFastCopy.js
 * @brief The Lightning Path for Local FS Transfers.
 * 
 * THE POEM OF THE FAST RIVER:
 * When the source and the destination share the same earthly clay (Local FS),
 * we do not need to pull the data up to the heavens and push it back down.
 * We simply tell the handles to pour their essence directly into one another.
 * But beware the mobile realms! Their permission walls are steep. 
 * If the lightning path is blocked, we gracefully retreat.
 */

import { LocalProvider } from '../../fs/local/index.js';

export const LocalFastCopy = {
    /**
     * @async
     * @function execute
     * @description Attempts high-speed direct handle-to-handle copying.
     */
    async execute(srcItem, destItem, onProgress) {
        try {
            // Obtain the direct physical handle of the destination directory
            const destHandle = await LocalProvider.getHandle(
                await LocalProvider._getRootHandle(destItem),
                destItem.path,
                { kind: 'directory' },
                destItem.workspaceId
            );

            // Execute the high-speed traversal
            await LocalProvider.fastCopy(srcItem, destHandle, onProgress);
            return true;
        } catch (e) {
            console.warn(`[LocalFastCopy] B"H - The fast path is blocked. This often happens on mobile or strict environments. Falling back to universal copy. Error:`, e);
            return false; // Signal failure so fallback can engage
        }
    }
};
