
// B"H
/**
 * @file LogicalPresence.js
 * @brief Verifies the workspace anchor in memory.
 */
import { State } from '../../../state.js';

export const LogicalPresence = {
    /**
     * @function getWorkspace
     * @description Finds the workspace in the state.
     */
    getWorkspace(item) {
        const worldId = item.workspaceId || item.id;
        return State.workspaces.find(w => String(w?.id) === String(worldId));
    }
};
