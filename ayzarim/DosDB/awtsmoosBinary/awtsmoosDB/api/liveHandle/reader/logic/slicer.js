
// B"H
/**
 * @file reader/logic/slicer.js
 * @chapter Chapter 51: The Window of Prophecy — Slicing the Infinite
 *
 * @description
 * "He set the boundary of the sea, saying: Thus far shall you come
 * and no further." (Job 38:11)
 *
 * This Slicer provides a precise window into sequential containers.
 * Whether it be a linked B-Tree or a contiguous Flat Array, the 
 * slicer calculates boundaries correctly and rehydrates segments of life.
 */

const constants       = require('../../../../constants.js');
const SequenceEngine  = require('../../../../structure/sequence/index.js');
const FlatArray       = require('../../../../structure/flat/array/index.js');
const SmartPointer    = require('../../../../utils/smartPointer/index.js');

module.exports = {

    /**
     * @method slice
     * @description Extracts hydrated sparks within a specific window of indices.
     */
    slice(handle, db, start, end, readerInstance) {
        handle.ensureResolved();

        // 1. Unveil the truth behind the handle, peeling Anchors if needed.
        const structPtr = handle.nav.resolveStructPtr();
        if (!structPtr) return [];

        const T = constants.VAL_TYPE;
        
        // RECTIFICATION: Discerning the effectively underlying archetype.
        let type = structPtr.type;
        if (handle.type === T.ANCHOR && !type) {
             type = handle.nav.resolveAnchorInnerType();
        }
        if (!type) type = handle.type;

        // ── MODE 1: THE FLAT PLANE (SMART_ARRAY) ──
        if (type === T.SMART_ARRAY) {
            const arr = new FlatArray(db.allocator, structPtr);
            const len = arr.length();

            // Seder normalization
            let s = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
            let e = (end === undefined) ? len : (end < 0 ? Math.max(len + end, 0) : Math.min(end, len));

            const res = [];
            for (let i = s; i < e; i++) {
                const p = arr.get(i);
                if (p) {
                    const val = SmartPointer.resolve(p, db.allocator);
                    res.push(readerInstance._wrapIfNeeded(val, i, p));
                }
            }
            if (db.sparseArrays) {
                res.push(...db.sparseArrays.slice(handle, s, e, (val, i, p) => readerInstance._wrapIfNeeded(val, i, p)));
            }
            return res;
        }

        // ── MODE 2: THE CHAINED SEQUENCE (SEQUENCE / ARRAY) ──
        const SequenceTypes = new Set([T.SEQUENCE, T.ARRAY, T.SET, T.JS_SET]);
        if (!SequenceTypes.has(type)) return [];

        const seq = new SequenceEngine(db.allocator, structPtr);
        const len = seq.length();

        // Seder normalization
        let s = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
        let e = (end === undefined) ? len : (end < 0 ? Math.max(len + end, 0) : Math.min(end, len));

        const res = [];
        for (let i = s; i < e; i++) {
            const p = seq.getPtr(i);
            if (p) {
                // Read from the root of the B-Tree sequence logic
                const val = seq.get(i);
                res.push(readerInstance._wrapIfNeeded(val, i, p));
            }
        }
        if (db.sparseArrays) {
            res.push(...db.sparseArrays.slice(handle, s, e, (val, i, p) => readerInstance._wrapIfNeeded(val, i, p)));
        }
        return res;
    }
};
