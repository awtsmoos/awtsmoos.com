
// B"H
/**
 * @file method.js
 * @description
 * Chapter 13: The Ritual of Matan (Bestowing)
 *
 * This module manifests the logic for the '.get()' method found upon 
 * the Map and Dictionary vessels. It represents the active seeking of a 
 * child vessel by its name.
 * 
 * "He called them into existence by their names." (Isaiah 40:26)
 * Just as the Infinite Awtsmoos identifies every individual spark through 
 * His wisdom, the '.get()' method allows the user to summon a specific 
 * coordinate from the binary mountain using its lexicographic key.
 *
 * This function returns a function—the actual behavior of the method—which 
 * delegates the search to the PropertyResolver.
 */

const PropertyResolver = require('../../property/index.js');

/**
 * @class MapGetMethod
 * @description 
 * Scribes the behavior for retrieving data sparks by key.
 */
class MapGetMethod {
    /**
     * @method execute
     * @description
     * Forges the callable '.get()' function for a specific handle state.
     * 
     * @param {Object} state - The soul-state of the handle.
     * @param {Object} receiver - The proxy (Kingdom of Speech).
     * @param {Object} internalDispatcher - The seeker of internal whispers.
     * @returns {Function} A function (key) => any
     */
    static execute(state, receiver, internalDispatcher) {
        /**
         * @function get
         * @description The functional gateway into the handle's children.
         * @param {string|number} key - The identifier of the data.
         * @returns {*} The hydrated value or child handle.
         */
        return (key) => {
            // 1. We first check if the 'key' sought is an internal metadata key.
            // This allows 'handle.get("_awtsmoos_metadata")' to function properly.
            const internalResult = internalDispatcher.dispatch(state, key, receiver);
            if (internalResult !== undefined) return internalResult;

            // 2. Perform the standard navigation and hydration ritual.
            // Descends through the B-Tree or Dictionary to the physical coordinate.
            return PropertyResolver.resolve(state, key);
        };
    }
}

module.exports = MapGetMethod;
