
// B"H
/**
 * @file WorkspaceOptimisticActivator.js
 * @brief THE TRUSTING BINDER.
 * 
 * THE POEM OF OPTIMISM:
 * We do not doubt the earth before we walk upon it.
 * Previously, the system assumed a workspace was locked until verified.
 * This caused the "Resume" badge to appear when it was not needed.
 * Now, we assume the world is open and ready. Only when the hand 
 * is rebuffed by the OS shall we declare the world locked.
 */

import { State } from '../../state.js';
import { IndexedDBProvider } from '../../fs/indexeddb.js';

export const WorkspaceOptimisticActivator = {
    /**
     * @async
     * @function ignite
     * @description Re-links Local Handles without triggering aggressive browser prompts.
     */
    async ignite() {
        for (const ws of State.workspaces) {
            if (ws.type === 'local') {
                try {
                    const handle = await IndexedDBProvider.getHandle(ws?.id);
                    if (handle) {
                        ws.handle = handle;
                        // B"H - TRUST: Assume it is unlocked.
                        // The LocalProvider's Error Shield will set isLocked=true 
                        // only if an actual operation is rejected.
                        ws.isLocked = false; 
                    } else {
                        // Handle truly deleted from IndexedDB
                        ws.isLocked = true;
                    }
                } catch (e) {
                    console.warn(`[Activator] B"H - Failed to link ${ws?.name}:`, e);
                    ws.isLocked = true;
                }
            }
        }
    }
};
