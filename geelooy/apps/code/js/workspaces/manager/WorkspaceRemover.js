
// B"H
/**
 * @file WorkspaceRemover.js
 * @brief The ritual of dissolving worlds back into the potential.
 * 
 * CHAPTER II: THE RE-ABSORBED LIGHT
 * Not every world is meant to remain in the forefront of perception.
 * Through the power of Tzimtzum (Contraction), we withdraw the light 
 * of a workspace, returning its form to the hidden potential of the void.
 * We purge the memory, we clear out the cache,
 * Before the old structure results in a crash.
 * The tabs are dissolved, the handles are gone,
 * While the Essence of All carries steadily on.
 * Even as a world disappears from the Sidebar, its letters 
 * remain in the higher source, waiting for a new utterance.
 */

import { State } from '../../state.js';
import { App } from '../../app.js';
import { Tabs } from '../../tabs/index.js';
import { SidebarOrchestrator } from './SidebarOrchestrator.js';
import { HandleCache } from '../../fs/local/handle-cache.js';

/**
 * @class WorkspaceRemover
 * @description Handles the systematic removal of a workspace and its associated visual footprints.
 */
export class WorkspaceRemover {
    /**
     * B"H - Removes a workspace and all its digital echoes.
     * @param {string|number} workspaceId - The identity of the world to be withdrawn.
     */
    static async remove(workspaceId) {
        const id = Number(workspaceId);
        
        // 1. Withdrawal from the State Census
        State.workspaces = State.workspaces.filter(ws => Number(ws.id) !== id);
        
        // 2. Purification of the Memory (HandleCache)
        // We must ensure the physical links are severed from the RAM.
        HandleCache.clear(); 
        
        // 3. Dissolution of Expanded Realms
        // Remove any record of expanded folders within this specific world.
        for (const key of State.expandedFolders) {
            // Keys are typically structured as "workspaceId::path"
            if (key.startsWith(id + "::") || key.includes("::" + id + "::")) {
                State.expandedFolders.delete(key);
            }
        }
        
        // 4. Closing the Portals (Tabs)
        // Any tab that draws its light from this world must be closed.
        const tabsToClose = State.tabs.filter(t => 
            Number(t.item.workspaceId) === id || Number(t.item.id) === id
        );
        
        for (const tab of tabsToClose) {
            await Tabs.close(tab.id, true);
        }
        
        // 5. Eternal Recording
        // Inscribe the new, contracted reality into the archive.
        App.saveSession(); 
        
        // 6. Visual Manifestation
        // Rebuild the sidebar to show the now-empty space.
        await SidebarOrchestrator.rebuild();
        
        console.log("B\"H [WorkspaceRemover] World " + id + " re-absorbed into the potential.");
    }
}
