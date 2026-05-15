
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

const MAPPING_TYPES = new Set([
    constants.VAL_TYPE.MAP,
    constants.VAL_TYPE.DICTIONARY,
    constants.VAL_TYPE.OBJECT,
    constants.VAL_TYPE.SMART_OBJECT,
    constants.VAL_TYPE.JS_MAP
]);

/**
 * @function effectiveType
 * @description Peels anchors for collision-aware property routing.
 * @param {object} state - Handle state.
 * @returns {number} Effective VAL_TYPE.
 */
function effectiveType(state) {
    if (state.type !== constants.VAL_TYPE.ANCHOR) return state.type;
    return state.nav.resolveAnchorInnerType() || constants.VAL_TYPE.DICTIONARY;
}

/**
 * @function hasStoredMappingKey
 * @description Checks whether a mapping owns a key before method dispatch.
 * @param {object} state - Handle state.
 * @param {string|number} prop - Requested property.
 * @returns {boolean} True when disk data should win over helper method names.
 */
function hasStoredMappingKey(state, prop) {
    if (!MAPPING_TYPES.has(effectiveType(state))) return false;

    try {
        return state.nav.resolveKey(prop) !== null;
    } catch (_err) {
        return false;
    }
}

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

        if (typeof prop === 'string' || typeof prop === 'number') {
            const overlaid = state.db && state.db.turbo
                ? state.db.turbo.get(state, prop)
                : { hit: false };
            if (overlaid.hit) return overlaid.value;
        }

        if ((typeof prop === 'string' || typeof prop === 'number') && hasStoredMappingKey(state, prop)) {
            return PropertyResolver.resolve(state, prop);
        }

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
