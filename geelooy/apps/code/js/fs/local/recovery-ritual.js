
// B"H
/**
 * @file recovery-ritual.js
 * @brief Healing the connection between the mind and the disk.
 */

import { UI } from '../../ui.js';
import { IndexedDBProvider } from '../indexeddb.js';

/**
 * @class RecoveryRitual
 * @description Rituals to awaken stale FileSystemHandles.
 */
export const RecoveryRitual = {
    /**
     * @async
     * @function verifyPermission
     * @description Checks if the vessel of the handle allows the flow of light (readwrite).
     */
    async verifyPermission(handle) {
        if (!handle) return false;
        try {
            const status = await handle.queryPermission({ mode: 'readwrite' });
            if (status === 'granted') return true;
            const request = await handle.requestPermission({ mode: 'readwrite' });
            return request === 'granted';
        } catch (e) { return false; }
    },

    /**
     * @async
     * @function attemptActivation
     * @description The primary restoration attempt using browser memory.
     */
    async attemptActivation(ws) {
        if (ws.handle) {
            if (await this.verifyPermission(ws.handle)) return ws.handle;
        }
        const stored = await IndexedDBProvider.getHandle(ws.id);
        if (stored) {
            if (await this.verifyPermission(stored)) {
                ws.handle = stored;
                return stored;
            }
        }
        return await this.reAnchor(ws);
    },

    async reAnchor(ws) {
        if (ws.type !== 'local') return null;
        try {
            UI.showToast(`Re-anchoring "${ws.name}"...`, "info");
            const newHandle = await window.showDirectoryPicker();
            if (newHandle) {
                ws.handle = newHandle;
                ws.isLocked = false;
                ws.isLost = false;
                await IndexedDBProvider.saveHandle(ws.id, newHandle);
                return newHandle;
            }
        } catch (e) { console.warn("B\"H: Anchor ritual ignored."); }
        return null;
    }
};
