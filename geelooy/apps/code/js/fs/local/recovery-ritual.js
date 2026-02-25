
// B"H
/**
 * @file recovery-ritual.js
 * @brief The Restoration of the Physical Link.
 */

import { UI } from '../../ui.js';
import { IndexedDBProvider } from '../indexeddb.js';

export const RecoveryRitual = {
    /**
     * @async
     * @function verifyPermission
     * @description Ensures the user has breathed life into the handle.
     */
    async verifyPermission(handle) {
        if (!handle) return false;
        try {
            // Check if the spark of permission is already present
            const status = await handle.queryPermission({ mode: 'readwrite' });
            if (status === 'granted') return true;
            
            // Request the spark
            const request = await handle.requestPermission({ mode: 'readwrite' });
            return request === 'granted';
        } catch (e) {
            return false;
        }
    },

    /**
     * @async
     * @function reAnchor
     * @description Strictly for PHYSICAL folders. Prompts for a new handle.
     */
    async reAnchor(ws) {
        // B"H - Guard the boundary: Internal storage doesn't re-anchor via picker.
        if (ws.type !== 'local') {
            console.warn(`B"H: Internal world ${ws.type} does not use re-anchor ritual.`);
            return null;
        }

        try {
            UI.showToast(`The physical connection to "${ws.name}" is severed. Re-select the folder.`, "warning");
            const newHandle = await window.showDirectoryPicker();
            if (newHandle) {
                ws.handle = newHandle;
                ws.isLocked = false;
                ws.isLost = false;
                ws.name = newHandle.name;
                
                await IndexedDBProvider.saveHandle(ws.id, newHandle);
                UI.showToast(`B"H: Physical anchor restored.`, "success");
                return newHandle;
            }
        } catch (e) {
            UI.showToast("Anchor ritual aborted.", "info");
        }
        return null;
    }
};
