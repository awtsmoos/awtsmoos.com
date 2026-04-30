
// B"H
/**
 * @file index.js (Traps/Get)
 * @chapter The Eye of Perception (Chochmah)
 * @description
 * Chapter 5: Chochmah - The Initial Glimpse of the Data.
 * 
 * When a developer looks at a LiveHandle, Chochmah is activated. This 
 * getter trap is the very first moment of contact between the mind 
 * and the database.
 * 
 * "Let there be light," and there was. In exactly O(1) time.
 * Every glance at a property flows through these unified layers:
 * 1. Check for Internal Soul Secrets (Signals).
 * 2. Ensure the Coordinate is Revealed (Resolution).
 * 3. Bestow an active method or return a physical spark (Dispatch).
 */

const SoulSecrets = require('./secrets/index.js');
const MethodDispatcher = require('./method/index.js');
const PropertyResolver = require('../logic/property/index.js');
const constants = require('../../../../constants.js');

module.exports = {
    /**
     * @method handle
     * @description Intercepts the property access and routes it correctly.
     * 
     * @param {Object} state - Internal handle soul.
     * @param {Object} tgt - Proxy target.
     * @param {string|symbol} prop - The requested name.
     * @param {Object} receiver - The Proxy object.
     * @returns {*}
     */
    handle(state, tgt, prop, receiver) {
        // 1. Peer into the secret chambers (e.g., toJSON, __resolve__)
        const secret = SoulSecrets.handle(state, prop);
        if (secret !== undefined) return secret;

        // 2. Peer into the physical void (Ensure coordinates are loaded)
        state.ensureResolved();

        // 3. Bestow the behavior (If it is a method like .get or .push)
        const method = MethodDispatcher.dispatch(state, prop, receiver);
        if (method !== undefined) return method;

        // 4. Inscribe the property seeking ritual
        if (typeof prop === 'string' || typeof prop === 'number') {
            return PropertyResolver.resolve(state, prop);
        }

        // 5. Absolute fallback to internal JS reflecting logic
        return Reflect.get(tgt, prop, receiver);
    }
};
