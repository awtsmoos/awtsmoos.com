
// B"H
/**
 * @file ZipContextGuard.js
 * @brief THE DEFENDER OF OBJECT INTEGRITY.
 * 
 * THE PSALM OF THE VALIDATED VESSEL:
 * The error "Cannot read properties of undefined (reading 'id')" was a lack 
 * of bitachon (trust) in the incoming data. We now wrap the selection in a 
 * shield of validation. No item shall enter the compression forge unless 
 * it possesses a confirmed World and identity.
 */

import { State } from '../../state.js';

export const ZipContextGuard = {
    /**
     * @function purifySelection
     * @description Hardens selected items by re-linking them to their active workspaces.
     */
    purifySelection(items) {
        if (!items || !Array.isArray(items)) return [];

        return items.map(item => {
            const worldId = item.workspaceId || item.id;
            const ws = State.workspaces.find(w => String(w?.id) === String(worldId));
            
            if (!ws) {
                console.warn(`[ZipGuard] B"H - Lost connection to World ${worldId} for item ${item.name}. Purifying via fallback.`);
                // If the workspace is gone, we cannot process this spark.
                return null;
            }

            // Return a reinforced vessel.
            return {
                ...item,
                workspaceId: ws.id,
                workspaceType: ws.originalType || ws.type,
                handle: ws.handle // Critical for local FS zip reading
            };
        }).filter(Boolean); // Remove the lost sparks.
    }
};
