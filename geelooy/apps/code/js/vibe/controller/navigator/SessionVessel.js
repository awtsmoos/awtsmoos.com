
// B"H
/**
 * @file SessionVessel.js
 * @brief The Manifestation of the Session Tab.
 * 
 * THE HYMN OF THE OPENED PORTAL:
 * The tab is a window, a gateway of light,
 * Reflecting the code in the user's clear sight.
 * We take the session from the deep memory stone,
 * And make its existence to the editor known!
 * No character escaped, no essence withheld,
 * As the Vibe of the Creator is locally swelled.
 */

import { VibeDB } from '../../db.js';
import { Tabs } from '../../../tabs/index.js';

/**
 * @class SessionVessel
 * @description Orchestrates the creation of the Vibe session tab.
 */
export class SessionVessel {
    /**
     * B"H - Opens or manifests a session tab.
     * @param {string} idKey - The unique seal.
     * @param {Object} folder - The physical folder.
     * @param {Object} stored - The remembered state.
     */
    static async manifest(idKey, folder, stored) {
        const wsId = folder.workspaceId || folder.id;
        
        let sessionData = stored;
        if (!sessionData) {
            console.log(`[SessionVessel] B"H - Genesis: New session for ${folder.name}`);
            sessionData = {
                id: idKey,
                name: `Vibe: ${folder.name}`,
                path: folder.path,
                workspaceId: wsId,
                originalType: folder.originalType || folder.type,
                history: [],
                viewState: { activeSidebarTab: 'tree', isSidebarCollapsed: false }
            };
            await VibeDB.saveSession(idKey, sessionData);
        } else {
            sessionData.workspaceId = wsId; // Ensure continuity
        }

        const tabModel = {
            ...folder,
            name: sessionData.name,
            type: 'vibe-session',
            workspaceId: wsId,
            originalType: folder.originalType || folder.type
        };

        return await Tabs.create({ ...tabModel, vibeSession: sessionData }, false, true, true);
    }
}
