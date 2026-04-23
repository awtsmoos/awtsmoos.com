
// B"H
/**
 * @file MobileGuard.js
 * @brief The Shield against Mobile Chaos.
 * 
 * THE POEM OF THE SHIELD:
 * Mobile phones are chaotic, untrusting, and wild,
 * Treating the file system like an untamed child.
 * If permission is dropped, or the API fails to speak,
 * We do not let the error make the whole UI weak.
 * We catch the rejection, we soften the blow,
 * And tell the Vibe Coder which other way to go.
 */

import { UI } from '../../ui.js';

export const MobileGuard = {
    /**
     * @function wrap
     * @description Wraps an async FS operation. If it fails with an access error, it returns a safe failure object rather than crashing.
     */
    async wrap(operationPromise, pathInfo) {
        try {
            return await operationPromise;
        } catch (e) {
            console.error(`[MobileGuard] B"H - FS Access Shield triggered for ${pathInfo}:`, e);
            
            // Check if it's a known permission or NotAllowed error
            if (e.name === 'NotAllowedError' || e.message.includes('permission') || e.message.includes('access')) {
                UI.showToast(`B"H - Mobile OS blocked access to ${pathInfo}. Try moving files to Browser Storage (IDB).`, "error", 5000);
                
                // Throw a custom error that the LoopEngine can catch and handle gracefully
                throw new Error(`MobileGuard_Blocked: ${e.message}`);
            }
            
            // Re-throw generic errors
            throw e;
        }
    }
};
