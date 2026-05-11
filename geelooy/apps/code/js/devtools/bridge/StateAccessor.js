
// B"H
import { StateRegistry } from './StateRegistry.js';

/**
 * @class StateAccessor
 * @description
 * 
 * CHAPTER I: THE RE-ALIGNED COORDINATE
 * 
 * In the realm of Asiyah, every Vision (Tab) is anchored 
 * to its own persistent memory vessel. The StateAccessor 
 * is the librarian who reaches into the Registry (the archive) 
 * to retrieve the Book of State.
 */
export class StateAccessor {
    /**
     * B"H - Resolves the unified state for a Vision.
     * @param {string|number} tabId - Target identity.
     * @param {Object} [snapshot=null] - Form to restore.
     * @returns {Object} The state vessel.
     */
    static getTabPersistentState(tabId, snapshot = null) {
        if (!tabId || tabId === "undefined") {
            console.warn("[StateAccessor] B\"H - Identity is void. Seeking shadow memory.");
            return null;
        }

        const id = String(tabId);
        const state = StateRegistry.get(id, snapshot);
        
        if (state) {
            console.log(`[StateAccessor] B"H - Memory revealed for Vision: ${id}`);
        }
        
        return state;
    }
}
