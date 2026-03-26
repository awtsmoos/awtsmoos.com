
// B"H
/**
 * @file recovery-ritual.js
 * @brief Healing the connection between the mind and the disk.
 * 
 * THE POEM OF THE LOST SPARK:
 * A handle to the earth, a grip upon the clay,
 * Sometimes the browser takes this holy right away.
 * We do not force the hand, we do not trap the sight,
 * We gently ask the void if it still holds the light.
 * If the answer is a silence, deep and absolute,
 * We return a null, and cut the corrupted root.
 * The Awtsmoos sustains all, but vessels can decay,
 * When the anchor shatters, we clear the debris away.
 */

import { IndexedDBProvider } from '../indexeddb.js';

/**
 * @class RecoveryRitual
 * @description Rituals to awaken stale FileSystemHandles without forcing aggressive native UI prompts.
 */
export const RecoveryRitual = {
    /**
     * @async
     * @function verifyPermission
     * @description Checks if the vessel of the handle allows the flow of light (readwrite).
     * The Awtsmoos provides permission to exist. We verify this permission.
     * @param {FileSystemHandle} handle - The physical anchor to verify.
     * @returns {Promise<boolean>} True if the light flows, false if blocked.
     */
    async verifyPermission(handle) {
        if (!handle) return false;
        try {
            const status = await handle.queryPermission({ mode: 'readwrite' });
            if (status === 'granted') return true;
            
            // Only request permission if it's currently promptable, but do not force a picker.
            const request = await handle.requestPermission({ mode: 'readwrite' });
            return request === 'granted';
        } catch (e) { 
            console.warn(`[RecoveryRitual] B"H - Verification failed: ${e.message}`);
            return false; 
        }
    },

    /**
     * @async
     * @function attemptActivation
     * @description The primary restoration attempt using browser memory.
     * It strictly queries existing memory and never forces the user into a native picker loop.
     * @param {Object} ws - The workspace vessel seeking its physical anchor.
     * @returns {Promise<FileSystemHandle|null>} The restored handle, or null if utterly lost.
     */
    async attemptActivation(ws) {
        // 1. Check existing runtime handle
        if (ws.handle) {
            if (await this.verifyPermission(ws.handle)) {
                return ws.handle;
            }
        }
        
        // 2. Check deep memory (IndexedDB)
        const stored = await IndexedDBProvider.getHandle(ws.id);
        if (stored) {
            if (await this.verifyPermission(stored)) {
                ws.handle = stored;
                return stored;
            }
        }
        
        // B"H - We no longer auto-prompt for directory selection here.
        // If the handle is lost, we return null, allowing the higher spheres
        // to handle the corruption gracefully.
        return null;
    }
};
