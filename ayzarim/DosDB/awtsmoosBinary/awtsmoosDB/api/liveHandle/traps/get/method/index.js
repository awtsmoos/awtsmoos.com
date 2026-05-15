
// B"H
/**
 * @file index.js (Method Dispatcher)
 * @chapter The Sorting of the Tribes (Birur HaNitzotzot)
 * @description
 * Like it says "Forever, Lord, Your Word stands in the heavens". 
 * The speech is constant and exact. It finds its target in a singular breath.
 * 
 * This module looks at the Archetype of the handle and determines 
 * which set of active Verbs (methods) should be available to the user.
 * It is the bridge between the dormant data on disk and the 
 * interactive experience of JavaScript.
 */

const constants = require('../../../../../constants.js');
const CollectionDispatcher = require('../../logic/collection/index.js');
const MappingDispatcher = require('../../logic/mapping/index.js');

/**
 * @class MethodDispatcher
 * @description The gatekeeper identifying structural roles.
 */
class MethodDispatcher {
    /**
     * @method dispatch
     * @description Identifies the type of handle and delegates to the appropriate logic.
     * 
     * @param {Object} state - Current handle state.
     * @param {string|symbol} prop - Property/Method name.
     * @param {Object} receiver - Proxy vessel.
     * @returns {any|undefined}
     */
    static dispatch(state, prop, receiver) {
        const type = this._getEffectiveType(state);
        const T = constants.VAL_TYPE;

        // Is this soul part of the Lineage of Sequences (Arrays)?
        const isSeq = new Set([T.SEQUENCE, T.SET, T.ARRAY, T.SMART_ARRAY, T.JS_SET, T.PACKED_ARRAY]).has(type);
        // Is this soul part of the Lineage of Mappings (Objects)?
        const isMap = new Set([T.MAP, T.DICTIONARY, T.OBJECT, T.SMART_OBJECT, T.JS_MAP, T.PACKED_OBJECT, T.PACKED_OBJECT]).has(type);

        if (isSeq) {
            const res = CollectionDispatcher.dispatch(state, prop, receiver);
            if (res !== undefined) return res;
        }

        if (isMap) {
            const res = MappingDispatcher.dispatch(state, prop, receiver);
            if (res !== undefined) return res;
        }

        return undefined;
    }

    /**
     * @private
     * @method _getEffectiveType
     * @description Peels the Anchor seal if necessary to find the real form below.
     */
    static _getEffectiveType(state) {
        if (state.type !== constants.VAL_TYPE.ANCHOR) return state.type;
        return state.nav.resolveAnchorInnerType() || constants.VAL_TYPE.DICTIONARY;
    }
}

module.exports = MethodDispatcher;
