
// B"H
/**
 * @file index.js
 * @description
 * Chapter 11: The Synthesis of Perception (Achdus)
 * 
 * "And the two became one." 
 * This module unites the two facets of "getting": the internal soul-properties
 * and the external database-methods.
 * 
 * The error that shattered the previous universe (TypeError: execute is not a function) 
 * was born from the lack of alignment between the parent Dispatcher and this vessel.
 * We now provide the '.execute' command to forge the '.get()' method, and 
 * the '.dispatch' command to resolve trap-level metadata requests.
 *
 * Everything is unified within the Essence of the Awtsmoos.
 */

const InternalDispatcher = require('./internal.js');
const MethodLogic = require('./method.js');

/**
 * @module GetAction
 * @description 
 * The Master Scribe of retrieving. Orchestrates the flow of requests for keys.
 */
const GetAction = {
    /**
     * @method execute
     * @description
     * Provides the behavior for the '.get()' Map method.
     * This is called by MappingDispatcher to build the handle's method dictionary.
     * 
     * @param {Object} state - The soul-state.
     * @param {Object} receiver - The proxy (Malchus).
     * @returns {Function} The '.get(key)' method implementation.
     */
    execute(state, receiver) {
        return MethodLogic.execute(state, receiver, InternalDispatcher);
    },

    /**
     * @method dispatch
     * @description
     * Provides direct resolution for internal metadata keys like '_awtsmoos_metadata'.
     * This is called by the getter trap during property access.
     * 
     * @param {Object} state - The soul-state.
     * @param {string|symbol} property - The property being accessed.
     * @param {Object} receiver - The proxy.
     * @returns {any|undefined}
     */
    dispatch(state, property, receiver) {
        return InternalDispatcher.dispatch(state, property, receiver);
    }
};

module.exports = GetAction;
