
// B"H
import { IndexedDBProvider } from '../indexeddb.js';

export const RecoveryRitual = {
    async verifyPermission(handle) {
        if (!handle) return false;
        try {
            const status = await handle.queryPermission({ mode: 'readwrite' });
            return status === 'granted';
        } catch (e) { 
            return false; 
        }
    },

    async attemptActivation(ws) {
        if (ws.handle) {
            // Optimistic fast-return if handle visually is held
            // Validation happens mid-air down the line
            return ws.handle; 
        }
        
        const stored = await IndexedDBProvider.getHandle(ws.id);
        if (stored) {
            // Again, optimistic assignment! DO NOT ask the browser permission here,
            // or Mobile devices get weird and hang without explicit click events.
            ws.handle = stored;
            return stored;
        }
        return null;
    }
};
