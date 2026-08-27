
// B"H
/**
 * @file PathJailer.js
 * @brief Bridge between Vibe tools and the core PathEngine.
 * 
 * POEM OF THE RECTIFIED GATEKEEPER:
 * The AI knocks upon the door of the root,
 * Seeking to harvest a different world's fruit.
 * But the Jailer is wise, the Jailer is firm,
 * Guarding the session throughout its whole term!
 * Bypassing the database, finding the truth,
 * In the physical tab, from the branch to the root.
 */

import { PathEngine } from '../../../core/paths/PathEngine.js';

export const PathJailer = {
    /**
     * B"H - Jails the path through the new array-based logic.
     * 
     * @param {string} requestedPath - The path from the AI.
     * @param {Object} tabItem - The physical tab item data.
     * @returns {string} The physical path within the workspace.
     */
    jail(requestedPath, tabItem) {
        if (!tabItem) return requestedPath || "/";
        
        // B"H - THE TIKKUN: Bypass potentially corrupted vibeSession memory.
        // We rely STRICTLY on the physical DOM tab.item.path, which is generated
        // fresh when the user clicks the folder.
        const sessionRoot = tabItem.path || "/";
        
        console.log(`[PathJailer] B"H - Jailing Intent: "${requestedPath}" within Floor: "${sessionRoot}"`);

        // Let the engine perform the holy Tzimtzum
        const physicalInternalPath = PathEngine.jailbreakSafeResolve(sessionRoot, requestedPath);
        
        console.log(`[PathJailer] B"H - Final Grounded Path: "${physicalInternalPath}"`);
        
        return physicalInternalPath;
    }
};
