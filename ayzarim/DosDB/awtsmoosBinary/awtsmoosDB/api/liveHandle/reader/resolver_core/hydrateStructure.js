
// B"H
/**
 * @file reader/resolver_core/hydrateStructure.js
 * @description
 * Chapter 40: The Formation of Reality.
 * 
 * This is the Great Orchestrator of rehydration. It looks at the binary coordinate 
 * (the Spark) and determines if it requires the garment of a Mapping or a Collection.
 * 
 * "His works are truthful, and His ways are just." 
 * We use a context map to handle circular references. The light 
 * must flow but it must not be lost in an infinite loop.
 */

const constants = require('../../../../constants.js');
const { getAddrKey } = require('./utils.js');
const RoutingAngel = require('./logic/routingAngel.js');

/**
 * @function hydrateStructure
 * @description Routes the shattered binary coordinates into their proper vessels.
 */
function hydrateStructure(val, context, db) {
    if (!val || !val.isStructure) return val;

    const ctx = (context instanceof Map) ? context : new Map();
    const addrKey = getAddrKey(val);
    
    // Check if the Soul already exists in this manifestation
    if (ctx.has(addrKey)) return ctx.get(addrKey);
    
    const T = constants.VAL_TYPE;
    let targetVal = val;
    
    // Anchor Revelation logic
    if (targetVal.type === T.ANCHOR) {
        const Anchor = require('../../../../structure/anchor/stable.js');
        const anchorManager = new Anchor(db);
        const resolved = anchorManager.resolve(targetVal.ptr);
        if (resolved) {
            targetVal = { 
                isStructure: true, type: resolved.type, 
                offset: resolved.offset, length: resolved.length, 
                ptr: targetVal.ptr 
            };
        }
    }

    // Delegation to the Routing Angel
    return RoutingAngel.direct(targetVal, ctx, addrKey, hydrateStructure, db);
}

module.exports = { hydrateStructure };
