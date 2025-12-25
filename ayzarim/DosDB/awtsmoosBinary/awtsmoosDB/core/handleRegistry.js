//B"H

/**
 * @file handleRegistry.js
 * @description
 *  The Book of Names. A private registry that connects the Proxy (Body)
 *  to its Internal State (Soul).
 * 
 *  The Essence (Awtsmoos) knows every spark by name. This registry 
 *  ensures that we can always find the soul of a vessel without 
 *  triggering the vessel's external traps.
 */

const registry = new WeakMap();
const SOUL_SIG = Symbol.for('Awtsmoos.Soul');

module.exports = {
    SOUL_SIG,
    
    /**
     * @description 
     *  Registers the internal state for a specific proxy.
     *  @param {Proxy} proxy - The physical interface.
     *  @param {object} state - The internal soul.
     */
    register(proxy, state) {
        state[SOUL_SIG] = true;
        registry.set(proxy, state);
    },

    /**
     * @description 
     *  Retrieves the internal state (Soul) of a handle.
     *  Works on both the Proxy and the raw state object.
     *  @param {object} obj - The object to inspect.
     *  @returns {object|undefined} The internal state.
     */
    getSoul(obj) {
        if (!obj) return undefined;
        if (registry.has(obj)) return registry.get(obj);
        if (obj[SOUL_SIG]) return obj;
        return undefined;
    },

    /**
     * @description 
     *  Checks if the object is a recognized database handle.
     *  @param {object} obj - The object to check.
     *  @returns {boolean}
     */
    isHandle(obj) {
        return !!this.getSoul(obj);
    },

    /**
     * @description 
     *  Factory for creating pure-mirror handles.
     *  Uses lazy-loading of the LiveHandle class to prevent 
     *  circular require loops that shatter the stack.
     * 
     *  @param {AwtsmoosDB} db - The Source.
     *  @param {Buffer} ptr - The Pointer.
     *  @param {number} type - The Type.
     *  @param {object} context - Hierarchical data.
     */
    createHandle(db, ptr, type, context = null) {
        const LiveHandle = require('../api/liveHandle/index.js');
        return new LiveHandle(db, ptr, type, context);
    }
};