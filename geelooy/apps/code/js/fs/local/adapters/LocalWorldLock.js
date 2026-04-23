
// B"H
/**
 * @file LocalWorldLock.js
 * @brief The Discernment of Permission.
 * 
 * THE POEM OF THE SEALED GATE:
 * A workspace is not locked until it is proven so. 
 * We do not greet the user with a demand for keys. 
 * We assume the path is open, and only when the gate is struck 
 * and found unyielding do we raise the flag of "Locked."
 */

export const LocalWorldLock = {
    /**
     * @function verify
     * @description Checks if a handle is currently permitted by the OS.
     * @returns {Promise<boolean>} True if open, false if sealed.
     */
    async verify(handle) {
        if (!handle) return false;
        try {
            // queryPermission is silent and does NOT trigger a prompt.
            const status = await handle.queryPermission({ mode: 'readwrite' });
            return status === 'granted';
        } catch (e) {
            return false;
        }
    },

    /**
     * @function request
     * @description Aggressively demands the key from the user via a native prompt.
     * MUST be called within a user-initiated event (like a click).
     */
    async request(handle) {
        if (!handle) return false;
        try {
            const status = await handle.requestPermission({ mode: 'readwrite' });
            return status === 'granted';
        } catch (e) {
            return false;
        }
    }
};
