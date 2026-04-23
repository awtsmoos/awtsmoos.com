
// B"H
/**
 * @file MobileGuard.js
 * @brief Shielding UI elements from raw, fatal, native FS explosions.
 */

import { LockedAccessError } from './LockedAccessError.js';

export const MobileGuard = {
    /**
     * @async
     * @function execute
     * @description Wraps the filesystem promise to specifically transfigure "NotAllowed" native errors.
     */
    async execute(promise, itemRef) {
        try {
            return await promise;
        } catch (e) {
            // If the native FS triggers an absolute blockage
            if (e.name === 'NotAllowedError' || e.message.toLowerCase().includes('permission denied')) {
                console.warn(`[MobileGuard] B"H - FS Guard captured a lethal access rejection for ${itemRef.path || itemRef.name}`);
                
                // Immediately alter global state to lock the vessel down
                import('../../../state.js').then(({ State }) => {
                    const wsId = itemRef.workspaceId || itemRef.id;
                    const ws = State.workspaces.find(w => w?.id === wsId);
                    if (ws) ws.isLocked = true;
                });
                
                // Throw the distinguishable custom error up to the Tree Renderer / Editor Loader
                throw new LockedAccessError(itemRef, e.message);
            }
            
            // Standard operational failure (File Not Found, generic errors)
            throw e;
        }
    }
};
