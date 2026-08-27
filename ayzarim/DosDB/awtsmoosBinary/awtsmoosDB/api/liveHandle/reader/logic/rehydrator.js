
// B"H
/**
 * @file api/liveHandle/reader/logic/rehydrator.js
 */
const Scalars = require('../reader/scalars.js');
const StructureRehydrator = require('../resolver_core/hydrateStructure.js');

module.exports = {
    /**
     * @method reify
     * @description Translates bytes into the manifest JS child.
     */
    reify(db, type, buf, ptr) {
        const StructuralTypes = [14, 15, 12, 18, 19, 20, 21]; // IDs for complex vessels

        if (StructuralTypes.includes(type)) {
            // Pass the coordination through the unified structural resolver
            return StructureRehydrator.hydrateStructure({ 
                isStructure: true, type, offset: ptr.offset, length: ptr.length, ptr: ptr.raw 
            }, new Map(), db);
        }

        // The simple spark of a scalar primitive
        return Scalars.read(type, buf);
    }
};
