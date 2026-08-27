
// B"H
/**
 * @file TabManifestor.js
 * @brief The Master of the Session Tab Genesis.
 * 
 * THE POEM OF THE HEALED RECORD:
 * If the database remembers a flaw or a tear,
 * We override its memory and banish the fear.
 * We take the fresh path from the user's own click,
 * And heal the deep database, sturdy and quick!
 */

import { VibeDB } from '../../../db.js';
import { Tabs } from '../../../../tabs/index.js';

/**
 * @class TabManifestor
 * @description Orchestrates the creation of the Vibe session tab with strict identity anchoring.
 */
export class TabManifestor {
    /**
     * B"H - Opens or manifests a session tab, ensuring the anchor is permanent.
     * @param {string} idKey - The unique seal for this session.
     * @param {Object} folder - The physical folder item.
     * @param {Object} stored - The existing session data from memory.
     */
    static async manifest(idKey, folder, stored) {
        // The Ikar (essence) is the workspace ID.
        const wsId = folder.workspaceId || folder.id;
        
        if (wsId === undefined || wsId === null) {
            throw new Error('B"H - Cannot manifest session: Physical workspace ID is void.');
        }

        const physicalPath = folder.path || "/";

        let sessionData = stored;
        
        if (!sessionData) {
            console.log(`[TabManifestor] B"H - Initiating New Session Vessel for ${folder.name} at ${physicalPath}`);
            sessionData = {
                id: idKey,
                name: 'Vibe: ' + folder.name,
                path: physicalPath,
                workspaceId: wsId,
                originalType: folder.originalType || folder.type,
                history: [],
                viewState: { activeSidebarTab: 'tree', isSidebarCollapsed: false }
            };
        } else {
            // B"H - THE HEALING RITUAL: 
            // Older versions of the app may have saved 'path: "/"' into IndexedDB.
            // We forcefully overwrite the DB record with the correct physical path.
            sessionData.workspaceId = wsId;
            sessionData.path = physicalPath;
            console.log(`[TabManifestor] B"H - Anchor healed and synchronized: ${wsId} @ ${physicalPath}`);
        }

        // Save the healed or new session back to the database
        await VibeDB.saveSession(idKey, sessionData);

        const tabModel = {
            ...folder,
            name: sessionData.name,
            type: 'vibe-session',
            workspaceId: wsId,
            path: physicalPath, // CRITICAL: Ensure the tab model carries the true path!
            vibeSession: sessionData,
            originalType: folder.originalType || folder.type
        };

        return await Tabs.create(tabModel, false, true, true);
    }
}
