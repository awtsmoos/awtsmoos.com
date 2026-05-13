
// B"H
/**
 * @file StateRegistry.js
 * @description
 * Quiet memory registry. Logs only when explicitly asked.
 */

const SHOULD_LOG = localStorage.getItem('awtsmoos.debug.stateRegistry') === 'true';

export class StateRegistry {
    static memory = new Map();

    static get(id, snapshot = null) {
        const key = String(id);

        if (!this.memory.has(key) && snapshot) {
            this.memory.set(key, snapshot);
        }

        return this.memory.get(key) || snapshot || null;
    }

    static set(id, value) {
        const key = String(id);
        this.memory.set(key, value);

        if (SHOULD_LOG) {
            console.log(`[StateRegistry] B"H - Solidifying new memory for Vision [${key}]`);
        }

        return value;
    }

    static delete(id) {
        this.memory.delete(String(id));
    }
}
