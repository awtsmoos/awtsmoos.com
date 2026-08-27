
// B"H
/**
 * @file DirectoryRefresher.js
 * @brief Awakes the visual sidebar tree to new manifestations.
 */

import { State } from '../../../../state.js';
import { Workspaces } from '../../../../workspaces/index.js';

export const DirectoryRefresher = {
    /**
     * B"H
     * Redraws specific folder nodes to show the new creations.
     */
    async refresh(triggerDirectoryUpdates, parentWorldId) {
        const foundationRef = State.workspaces.find(vessel => String(vessel?.id) === String(parentWorldId));
        if (!foundationRef) return;
        const corePhysicalContextType = foundationRef.originalType || foundationRef.type;

        for (const coordPoint of triggerDirectoryUpdates) {
            await Workspaces.refreshNode({ 
                ...foundationRef, 
                path: coordPoint, 
                kind: 'directory', 
                workspaceId: parentWorldId, 
                type: corePhysicalContextType 
            });
        }
    }
};
