
// B"H
/**
 * @file LocalRoot.js
 * @brief Safely obtains the absolute base root of the Workspace.
 */

import { State } from '../../state.js';
import { RecoveryRitual } from './recovery-ritual.js';

export const LocalRoot = {
    /**
     * B"H
     * Manifests the root FileSystemDirectoryHandle for the given context.
     * @param {Object} item - The target item carrying workspace context.
     * @returns {Promise<FileSystemDirectoryHandle>}
     */
    async get(item) {
        const type = (item.originalType || item.type).toLowerCase();
        const wsId = item.workspaceId || item.id;
        
        if (type === 'opfs') return await navigator.storage.getDirectory();
        
        if (type === 'local') {
            // 1. Search the Book of Living Worlds (Active State)
            let ws = State.workspaces.find(w => String(w?.id) === String(wsId));
            
            // 2. If workspace found and has a valid handle, return it
            if (ws && ws.handle && !ws.isLocked) {
                return ws.handle;
            }
            
            // 3. If no handle in memory, attempt the Recovery Ritual from the Archive (IDB)
            console.log(`[LocalRoot] B"H - Seeking lost anchor for Workspace ${wsId}`);
            const recoveredHandle = await RecoveryRitual.attemptActivation(ws || { id: wsId, type: 'local' });
            
            if (!recoveredHandle) {
                if (ws) ws.isLocked = true;
                // B"H - We provide the exact error message that UI.js listens for to show the "Grant" button
                throw new Error(`The earthly anchor is sealed. Action required to open.`);
            }
            
            // Update the live state with the recovered spark
            if (ws) {
                ws.handle = recoveredHandle;
                ws.isLocked = false;
            } else {
                // If it wasn't in State, we might need a re-sync
                console.warn(`[LocalRoot] Workspace ${wsId} exists in IDB but not in State.`);
            }
            
            return recoveredHandle;
        }
        
        throw new Error(`Unknown origin coordinate type: ${type}`);
    }
};
