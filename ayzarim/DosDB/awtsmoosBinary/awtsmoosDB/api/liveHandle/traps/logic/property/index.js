
// B"H
/**
 * @file index.js (Property Resolver)
 * @chapter The Manifestation of Matter
 * @description
 * This is the conduit that brings abstract sparks down from the 
 * infinite and identifies whether they are Structural (Beriah/Cities) 
 * or Primitive (Atziluth/Sparks). 
 * 
 * If a spark is identified as a vessel containing other sparks, it remains 
 * wrapped as a LiveHandle Proxy, allowing the seeker to descend deeper 
 * into the abyss. If it is an indivisible spark of Truth (a Primitive), 
 * it is revealed in its full light instantly.
 */

const constants = require('../../../../../constants.js');
const StructureResolver = require('./structure/index.js');
const PrimitiveResolver = require('./primitive/index.js');
const NativeResolver = require('../../../reader/native/index.js');
const PackedLive = require('../../../../packed/liveObject.js');
const PackedArray = require('../../../../packed/liveArray.js');
const T = constants.VAL_TYPE;

/**
 * @class PropertyResolver
 * @description Deciphers the coordinates of a child and manifests it.
 */
class PropertyResolver {
    /**
     * @method resolve
     * @description Identifies the type of a property and resurrects it appropriately.
     * 
     * @param {Object} state - Current handle state.
     * @param {string|number} prop - The key sought.
     * @returns {*} Either a primitive value or a new LiveHandle proxy.
     */
    static resolve(state, prop) {

        if (state.type === T.PACKED_OBJECT) {
            const out = PackedLive.get(state.db, state.ptr, prop);
            return out.hit ? out.value : undefined;
        }
        if (state.type === T.PACKED_ARRAY) {
            const out = PackedArray.get(state.db, state.ptr, prop);
            return out.hit ? out.value : undefined;
        }
        if (state.type === T.PACKED_ARRAY) {
            const out = PackedArray.get(state.db, state.ptr, prop);
            return out.hit ? out.value : undefined;
        }

        // Find the coordinates of the child in the deep void.
        const res = state.nav.resolveKey(prop);
        if (!res || !res.ptr) return undefined;

        // Form a new handle (gateway) for the found coordinate.
        const nextHandle = state.nav.navigate(prop, res.ptr, res.type);

        const native = NativeResolver.resolveNative(
            state.db,
            res.type,
            res.ptr,
            {
                parent: state.self,
                key: prop
            }
        );

        if (native.hit) return native.value;

        /** @type {Set&lt;number>} Types that represent containing vessels */
        const containerTypes = new Set([
            T.MAP, T.SEQUENCE, T.DICTIONARY, T.OBJECT, T.ARRAY,
            T.SMART_OBJECT, T.SMART_ARRAY, T.ANCHOR, T.JS_MAP, T.PACKED_OBJECT, T.PACKED_ARRAY
        ]);

        if (containerTypes.has(res.type)) {
            // Keep it wrapped as a portal for further exploration.
            return StructureResolver.resolve(nextHandle);
        }
        
        // Reveal the final atomic truth.
        return PrimitiveResolver.resolve(nextHandle);
    }
}

module.exports = PropertyResolver;
