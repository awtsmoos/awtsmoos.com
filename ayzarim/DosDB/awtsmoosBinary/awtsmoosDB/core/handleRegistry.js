// B"H
/**
 * @file handleRegistry.js
 * @description
 *  The Book of Names. A private registry that connects the Body (Proxy)
 *  to its Soul (Internal Target). 
 *  This allows the engine to identify handles without adding properties to them.
 */

// Use WeakMap so that if a handle is garbage collected, the registry doesn't leak memory.
const registry = new WeakMap();

module.exports = {
    /**
     * @description Registers a Proxy and its internal target.
     */
    register(proxy, soul) {
        registry.set(proxy, soul);
    },

    /**
     * @description Peeks behind the veil to find the soul.
     */
    getSoul(proxy) {
        return registry.get(proxy);
    },

    /**
     * @description Checks if the object is a recognized Body.
     */
    isHandle(proxy) {
        return registry.has(proxy);
    }
};
