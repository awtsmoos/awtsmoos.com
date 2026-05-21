// B"H
/**
 * @file eventBus.js
 * @description
 * A tiny scoped event river for the living post reader. It keeps modules from
 * grabbing each other directly while still allowing comment submissions,
 * approvals, AI saves, sidebar shifts, and coordinate changes to announce what
 * has happened.
 */

const listeners = new Map();
const history = [];
const MAX_HISTORY = 120;

/**
 * @function onAwtsmoosEvent
 * @description Subscribes to a named post-reader event.
 * @param {string} name Event name.
 * @param {Function} handler Event handler.
 * @returns {Function} Unsubscribe function.
 */
export function onAwtsmoosEvent(name, handler) {
    if (!name || typeof handler !== "function") {
        throw new TypeError("onAwtsmoosEvent requires an event name and handler.");
    }

    const set = listeners.get(name) || new Set();
    set.add(handler);
    listeners.set(name, set);

    return () => {
        set.delete(handler);
        if (!set.size) listeners.delete(name);
    };
}

/**
 * @function emitAwtsmoosEvent
 * @description Emits an event to local subscribers and the DOM window.
 * @param {string} name Event name.
 * @param {object} [detail={}] Event detail.
 * @returns {object} Event packet.
 */
export function emitAwtsmoosEvent(name, detail = {}) {
    if (!name) throw new TypeError("emitAwtsmoosEvent requires an event name.");

    const packet = {
        name,
        detail: detail || {},
        at: Date.now()
    };

    history.push(packet);
    if (history.length > MAX_HISTORY) history.shift();

    const set = listeners.get(name);
    if (set) {
        for (const handler of Array.from(set)) {
            try {
                handler(packet);
            } catch (err) {
                console.error("B\"H - Awtsmoos event handler failed:", name, err);
            }
        }
    }

    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(new CustomEvent(`awtsmoos:${name}`, { detail: packet.detail }));
    }

    return packet;
}

/**
 * @function getAwtsmoosEventHistory
 * @description Returns recent event packets, newest last.
 * @param {string} [name] Optional event-name filter.
 * @returns {Array<object>} Recent events.
 */
export function getAwtsmoosEventHistory(name = null) {
    return name ? history.filter(item => item.name === name) : history.slice();
}

/**
 * @function clearAwtsmoosEventHistory
 * @description Clears remembered packets. Intended for tests and diagnostics.
 * @returns {void}
 */
export function clearAwtsmoosEventHistory() {
    history.length = 0;
}
