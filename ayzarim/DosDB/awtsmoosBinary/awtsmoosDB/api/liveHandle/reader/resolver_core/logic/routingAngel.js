// B"H
/**
 * @file routingAngel.js
 * @description
 * Chapter 43: The Gatekeeper of Shapes.
 *
 * This module routes structure pointers to the correct hydration strategy
 * with minimal branching overhead. Collections (Array/Set variants) flow to
 * the sequence hydrator, and mappings (Object/Dictionary/Map variants) flow
 * to the mapping hydrator.
 */

const constants = require('../../../../../constants.js');
const SmartPointer = require('../../../../../utils/smartPointer/index.js');
const hydrateMapping = require('../hydrateMapping.js');
const hydrateCollection = require('../hydrateCollection.js');

const T = constants.VAL_TYPE;

const COLLECTION_TYPES = new Set([
    T.SEQUENCE,
    T.ARRAY,
    T.SET,
    T.JS_SET,
    T.SMART_ARRAY
]);

const MAPPING_TYPES = new Set([
    T.DICTIONARY,
    T.OBJECT,
    T.MAP,
    T.JS_MAP,
    T.SMART_OBJECT,
    T.JSON
]);

/**
 * @class RoutingAngel
 * @description Type router for structure rehydration.
 */
class RoutingAngel {
    /**
     * @static
     * @method direct
     * @param {Object} targetVal - Structure descriptor to hydrate.
     * @param {Map<string, any>} ctx - Circular-reference guard map.
     * @param {string} addrKey - Stable address key for memoization.
     * @param {Function} hydrateStructureFn - Recursive structure hydrator.
     * @param {Object} db - Database instance with allocator.
     * @returns {any} Hydrated JS value for the provided structure descriptor.
     */
    static direct(targetVal, ctx, addrKey, hydrateStructureFn, db) {
        if (!targetVal || !targetVal.isStructure) return targetVal;

        if (COLLECTION_TYPES.has(targetVal.type)) {
            return hydrateCollection.hydrate(targetVal, ctx, addrKey, hydrateStructureFn, db);
        }

        if (targetVal.type === T.CUSTOM_INSTANCE) {
            const pointer = SmartPointer.encode(
                targetVal.type,
                targetVal.offset || 0,
                targetVal.length || 0
            );
            return SmartPointer.resolve(pointer, db.allocator, ctx);
        }

        if (MAPPING_TYPES.has(targetVal.type)) {
            return hydrateMapping.hydrate(targetVal, ctx, addrKey, hydrateStructureFn, db);
        }

        return hydrateMapping.hydrate(targetVal, ctx, addrKey, hydrateStructureFn, db);
    }
}

module.exports = RoutingAngel;
