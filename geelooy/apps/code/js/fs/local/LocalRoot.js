
// B"H
/**
 * @file LocalRoot.js
 * @brief Safely obtains the absolute base root of the Workspace.
 * 
 * THE BASE OF CREATION:
 * Before traversing to a specific file, one must obtain the roots.
 * If the workspace is locked by the OS, we attempt an optimistic
 * recovery via IndexedDB without alerting the user, maintaining the peace.
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
        const type = item.originalType || item.type;
        const wsId = item.workspaceId || item.id;
        
        if (type === 'opfs') return await navigator.storage.getDirectory();
        
        if (type === 'local') {
            const ws = State.workspaces.find(w => String(w?.id) === String(wsId));
            
            if (ws && ws.handle && !ws.isLocked) {
                return ws.handle;
            }
            
            const recoveredHandle = await RecoveryRitual.attemptActivation(ws || { id: wsId, type: 'local', name: item.name || 'Unknown' });
            
            if (!recoveredHandle) {
                if (ws) ws.isLocked = true;
                throw new Error(`The earthly anchor is sealed. Action required to open.`);
            }
            
            if (ws) {
                ws.handle = recoveredHandle;
                ws.isLocked = false;
            }
            
            return recoveredHandle;
        }
        throw new Error(`Unknown origin coordinate type: ${type}`);
    }
};
