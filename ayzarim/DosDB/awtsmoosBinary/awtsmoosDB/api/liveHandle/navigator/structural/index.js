
// B"H
/**
 * @file index.js (Structural Logic)
 * @chapter The Dimensions of Space (Makom)
 * 
 * Chapter 32: The Pillar of Location.
 * Every entity exists in a "Place" (Makom) which is assigned during 
 * its emanation. This module resolves those physical dimensions (offset and length) 
 * so that the logic engines can read from the correct segment of the SSD mirror.
 */

const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');
const HandleRegistry = require('../../../../core/registry/handle.js');

class StructuralLogic {
    /**
     * @method resolveCoords
     * @description
     * Translates a handle's pointer into actual binary coordinates {offset, length, type}.
     * 
     * @param {Object} state - The soul-state.
     * @returns {Object|null}
     */
    static resolveCoords(state) {
        const T = constants.VAL_TYPE;

        // B"H: Path 1 - Anchor Stability Check (Type 50)
        // Reaches into the 32-byte fixed block to find current data address.
        if (state.type === T.ANCHOR) {
            const Anchor = require('../../../../structure/anchor/stable.js');
            const manager = new Anchor(state.db);
            // Peels away the identity wrapper
            const res = manager.resolve(state.ptr);
            // B"H: THE TIKKUN - Including 'type' so engines are enlightened
            if (res) return { offset: res.offset, length: res.length, type: res.type };
            return null;
        }

        // Path 2 - Direct Pointer Check
        if (state.ptr) {
            const dec = SmartPointer.decode(state.ptr);
            if (dec) return { offset: dec.offset, length: dec.length, type: dec.type };
        }

        // Path 3 - Root Registry Check (Final apex)
        const db = state.db;
        if (db.root && state === HandleRegistry.getSoul(db.root) && db.rootPtrRaw) {
            const dec = SmartPointer.decode(db.rootPtrRaw);
            if (dec) return { offset: dec.offset, length: dec.length, type: dec.type };
        }

        // Return to the abyss of Null
        return null;
    }
}

module.exports = StructuralLogic;
