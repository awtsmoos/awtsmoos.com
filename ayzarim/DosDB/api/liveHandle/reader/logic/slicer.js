
// B"H
/**
 * @file reader/logic/slicer.js
 * @chapter Chapter 51: The Window of Prophecy — Slicing the Infinite
 *
 * @description
 * In the celestial architecture, Ein-Sof (the Infinite) cannot be
 * grasped in its totality. A prophet receives only a "window" — a
 * specific slice of the divine light.
 *
 * This Slicer module provides that prophetic window. It normalization 
 * Python-style negative indices and handles both compact micro-vessels 
 * (FlatArrays) and expansive B-Tree chains.
 *
 * RECTIFICATION: We have ensured the slicer identifies the true archetype 
 * of anchored sequences. Even when the portal appears as an Anchor (50), 
 * the Slicer peers inside to find the Sequence within.
 */

const constants       = require('../../../../constants.js');
const SequenceEngine  = require('../../../../structure/sequence/index.js');
const FlatArray       = require('../../../../structure/flat/array/index.js');
const SmartPointer    = require('../../../../utils/smartPointer/index.js');

module.exports = {

    /**
     * @method slice
     * @description
     * "He set the boundary of the sea, saying: Thus far shall you come
     * and no further." (Job 38:11)
     *
     * Extracts a segment of data based on provided boundaries.
     * 
     * @param {Object} handle - The soul-state.
     * @param {Object} db - The DB instance.
     * @param {number} start - Beginning boundary.
     * @param {number|undefined} end - Ending boundary.
     * @param {Object} readerInstance - Parent Reader for wrapping children.
     * @returns {Array&lt;*>} A slice of hydrated JS existence.
     */
    slice(handle, db, start, end, readerInstance) {
        handle.ensureResolved();

        // Peel the Anchor layer if needed to get structural coordinates.
        const structPtr = handle.nav.resolveStructPtr();
        if (!structPtr) return [];

        const T = constants.VAL_TYPE;
        
        // IDENTIFY TRUE NATURE: Anchor aware logic.
        let type = handle.type;
        if (type === T.ANCHOR) {
            type = handle.nav.resolveAnchorInnerType() || T.SEQUENCE;
        }

        // ── BRANCH A: SMART_ARRAY (FlatArray — compact contiguous storage) ──
        if (type === T.SMART_ARRAY) {
            const arr = new FlatArray(db.allocator, structPtr);
            const len = arr.length();

            let s = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
            let e = (end === undefined) ? len : (end < 0 ? Math.max(len + end, 0) : Math.min(end, len));

            const res = [];
            for (let i = s; i < e; i++) {
                const p   = arr.get(i);
                if (p) {
                    const val = SmartPointer.resolve(p, db.allocator);
                    res.push(readerInstance._wrapIfNeeded(val, i, p));
                }
            }
            return res;
        }

        // ── BRANCH B: SEQUENCE / ARRAY / SET / JS_SET (linked-node chains) ──
        const SequenceTypes = new Set([T.SEQUENCE, T.ARRAY, T.SET, T.JS_SET]);
        if (!SequenceTypes.has(type)) return [];

        const seq = new SequenceEngine(db.allocator, structPtr);
        const len = seq.length();

        let s = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
        let e = (end === undefined) ? len : (end < 0 ? Math.max(len + end, 0) : Math.min(end, len));

        const res = [];
        for (let i = s; i < e; i++) {
            const p   = seq.getPtr(i);
            if (p) {
                const val = seq.get(i);
                res.push(readerInstance._wrapIfNeeded(val, i, p));
            }
        }
        return res;
    }
};
