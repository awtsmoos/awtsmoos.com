
// B"H
/**
 * @file OptimisticHandle.js
 * @brief THE TRUSTING BINDER.
 */

import { State } from '../../../state.js';
import { IndexedDBProvider } from '../../indexeddb.js';

export const OptimisticHandle = {
    /**
     * @async
     * @function restoreAll
     * @description Forges optimistic links for all Local workspaces on start.
     */
    async restoreAll() {
        console.log(`[Optimist] B"H - Awakening Local bonds.`);
        
        for (const ws of State.workspaces) {
            if (ws.type === 'local') {
                try {
                    const handle = await IndexedDBProvider.getHandle(ws?.id);
                    if (handle) {
                        ws.handle = handle;
                        
                        // B"H - THE FIX: Assume it is unlocked on boot!
                        // The MobileGuard/Provider logic will catch it if the OS actually blocks it later.
                        ws.isLocked = false; 
                    } else {
                        // Truly lost from DB memory.
                        ws.isLocked = true;
                    }
                } catch (e) {
                    ws.isLocked = true;
                }
            }
        }
    }
};
