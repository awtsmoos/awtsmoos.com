//B"H

/**
 * @file handleRegistry.js
 * @description
 *  The Book of Names. Maps Proxies to their internal synchronous souls.
 */

const registry = new WeakMap();
const SOUL_SIG = Symbol.for('Awtsmoos.Soul');

module.exports = {
    SOUL_SIG,
    
    register(proxy, state) {
        state[SOUL_SIG] = true;
        registry.set(proxy, state);
    },

    getSoul(obj) {
        if (!obj) return undefined;
        if (registry.has(obj)) return registry.get(obj);
        if (obj && obj[SOUL_SIG]) return obj;
        // B"H: If obj is a simple object wrapping a handle (rare) or user-data
        return undefined;
    },

    isHandle(obj) {
        return !!this.getSoul(obj);
    },

    /**
     * @description Synchronously manifests a new LiveHandle portal.
     */
    createHandle(db, ptr, type, context = null) {
        const LiveHandle = require('../api/liveHandle/index.js');
        return new LiveHandle(db, ptr, type, context);
    }
};