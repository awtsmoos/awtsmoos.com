
// B"H
/**
 * @file hydrateStructure.js
 * @description Routes the shattered dimensions into their proper hydration matrices.
 */
const constants = require('../../../../constants.js');
const { getAddrKey } = require('./utils.js');
const MappingHydrator = require('./hydrateMapping.js');
const CollectionHydrator = require('./hydrateCollection.js');

function hydrateStructure(val, context, db) {
    if (!val || !val.isStructure) return val;
    const ctx = (context instanceof Map) ? context : new Map();
    const addrKey = getAddrKey(val);
    
    if (ctx.has(addrKey)) return ctx.get(addrKey);
    
    const T = constants.VAL_TYPE;

    let targetVal = val;
    
    // Unfold the Anchor into its true structural body before rehydration
    if (targetVal.type === T.ANCHOR) {
        const Anchor = require('../../../../structure/anchor/stable.js');
        const anchorManager = new Anchor(db);
        const resolved = anchorManager.resolve(targetVal.ptr);
        if (resolved) {
            targetVal = { isStructure: true, type: resolved.type, offset: resolved.offset, length: resolved.length, ptr: targetVal.ptr };
        }
    }
    
    if (targetVal.type === T.DICTIONARY || targetVal.type === T.OBJECT || targetVal.type === T.SMART_OBJECT || targetVal.type === T.MAP || targetVal.type === T.JS_MAP) {
        return MappingHydrator.hydrate(targetVal, ctx, addrKey, hydrateStructure, db);
    }
    
    if (targetVal.type === T.SEQUENCE || targetVal.type === T.ARRAY || targetVal.type === T.SET || targetVal.type === T.JS_SET || targetVal.type === T.SMART_ARRAY) {
        return CollectionHydrator.hydrate(targetVal, ctx, addrKey, hydrateStructure, db);
    }
    
    return targetVal;
}

module.exports = { hydrateStructure };
