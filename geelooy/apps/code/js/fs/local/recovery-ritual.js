
// B"H
/**
 * @file recovery-ritual.js
 * @brief The Restoration of the Severed Link.
 * 
 * THE HYMN OF RE-ANCHORING:
 * When the gate is closed and the lock is fast,
 * We recall the connection that formed in the past.
 * We call to the user, the breath and the soul,
 * To pick up the key and make the world whole.
 * The Awtsmoos provides the path to restore,
 * To open the handle and enter once more.
 * Permission is willed, then granted by hand,
 * Stabilizing the light across all of the land.
 */

import { UI } from '../../ui.js';
import { IndexedDBProvider } from '../indexeddb.js';

/**
 * @class RecoveryRitual
 * @description A specialized module for healing broken or locked FileSystemHandles.
 * It interacts with the user to re-manifest the necessary permissions or physical anchors.
 */
export const RecoveryRitual = {
    /**
     * @async
     * @function verifyPermission
     * @description Checks if the user has granted the breath of life (readwrite permission) 
     * to the vessel. If not, it attempts to request it.
     * @param {FileSystemHandle} handle - The handle to verify.
     * @returns {Promise<boolean>} True if the light of permission is granted.
     */
    async verifyPermission(handle) {
        if (!handle) return false;
        try {
            const status = await handle.queryPermission({ mode: 'readwrite' });
            if (status === 'granted') return true;
            
            // The sacred request for intervention.
            const request = await handle.requestPermission({ mode: 'readwrite' });
            return request === 'granted';
        } catch (e) {
            console.warn("B\"H: Permission request failed.", e);
            return false;
        }
    },

    /**
     * @async
     * @function reAnchor
     * @description The ritual of re-selection. When a handle is truly lost or 
     * unrecoverable, this prompts the user to point to the directory once more.
     * @param {object} ws - The workspace object whose anchor must be restored.
     * @returns {Promise<FileSystemDirectoryHandle|null>} The new root handle.
     */
    async reAnchor(ws) {
        try {
            UI.showToast(`The anchor for "${ws.name}" is loose. Please re-select the folder.`, "warning");
            
            // Awaiting the user's creative choice.
            const newHandle = await window.showDirectoryPicker();
            if (newHandle) {
                // Update the state and the persistent archive.
                ws.handle = newHandle;
                ws.isLocked = false;
                ws.isLost = false;
                ws.name = newHandle.name;
                
                await IndexedDBProvider.saveHandle(ws.id, newHandle);
                
                UI.showToast(`B"H: Anchor stabilized for "${ws.name}".`, "success");
                return newHandle;
            }
        } catch (e) {
            UI.showToast("The re-anchor ritual was not completed.", "info");
        }
        return null;
    }
};
