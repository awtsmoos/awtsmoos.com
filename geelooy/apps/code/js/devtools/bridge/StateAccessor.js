
// B"H
import { StateRegistry } from './StateRegistry.js';

const SHOULD_LOG_MEMORY = localStorage.getItem('awtsmoos.debug.stateAccessor') === 'true';

export class StateAccessor {
    static getTabPersistentState(tabId, snapshot = null) {
        if (!tabId || tabId === 'undefined') {
            console.warn('[StateAccessor] B"H - Identity is void. Seeking shadow memory.');
            return null;
        }

        const id = String(tabId);
        const state = StateRegistry.get(id, snapshot);

        if (state && SHOULD_LOG_MEMORY) {
            console.log(`[StateAccessor] B"H - Memory revealed for Vision: ${id}`);
        }

        return state;
    }
}
