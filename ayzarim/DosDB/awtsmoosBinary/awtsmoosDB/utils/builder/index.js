
/**
 * @file index.js
 * @chapter The Master Scribe
 * @description
 * Creation is recursive. Every level of the soul contains all other levels.
 * This Builder takes the Infinite Paradox—an object containing itself—
 * and transforms it into the finite scroll of binary bytes.
 * 
 * CIRCULAR FIX: 
 * By pre-allocating an Identity Anchor for every complex container,
 * we ensure that 'A -> B -> A' loops point to the STABLE anchor pointer,
 * resolving the TypeError during stressful tests.
 */

const IdentityAnchor = require('../../structure/anchor/yesod.js');
const constants = require('../../constants.js');

class StructBuilder {
    constructor(allocator) {
        this.allocator = allocator;
        this.db = allocator.db;
    }

    /**
     * @description Transmutes an abstract thought into binary manifestation.
     */
    build(val, visited = new Map()) {
        if (val === null || val === undefined || typeof val !== 'object') {
            return this.db.primitiveSaver.save(val);
        }

        // Circular Tikkun: Have we seen this spark before?
        if (visited.has(val)) {
            return visited.get(val);
        }

        const isContainer = Array.isArray(val) ||
            (val && (val.constructor.name === 'Object' || val._isAwtsmoosMap));

        const isCustomInstance =
            !isContainer &&
            !Buffer.isBuffer(val) &&
            !(val instanceof Date) &&
            !(val instanceof RegExp) &&
            !(val instanceof Error) &&
            !(val instanceof Map) &&
            !(val instanceof Set) &&
            !(val instanceof WeakMap) &&
            !(val instanceof WeakSet) &&
            !(val instanceof Promise) &&
            !ArrayBuffer.isView(val) &&
            !(val instanceof ArrayBuffer) &&
            !!(val.constructor && val.constructor !== Object);

        if (isCustomInstance && this.allocator && typeof this.allocator._saveCustomInstance === 'function') {
            return this.allocator._saveCustomInstance(val, visited);
        }

        if (!isContainer) {
            return this.db.primitiveSaver.save(val);
        }

        // 1. Forge the Stable Head first (The Yesod)
        const anchor = new IdentityAnchor(this.db);
        const anchorPtr = anchor.create(
            Array.isArray(val) ? constants.VAL_TYPE.SEQUENCE : constants.VAL_TYPE.DICTIONARY,
            Buffer.alloc(0) // Empty initially
        );

        // 2. Mark the soul as "Visiting"
        visited.set(val, anchorPtr);

        // 3. Delegate based on type
        let dataPtr;
        if (Array.isArray(val)) {
            dataPtr = this._buildSequence(val, visited);
        } else {
            dataPtr = this._buildMap(val, visited);
        }

        // 4. Bind the Finished Magnitude to the Stable Anchor
        anchor.update(
            Array.isArray(val) ? constants.VAL_TYPE.SEQUENCE : constants.VAL_TYPE.DICTIONARY,
            dataPtr
        );

        return anchorPtr;
    }

    _buildSequence(arr, visited) {
        const Sequence = require('../../structure/sequence/index.js');
        const seq = new Sequence(this.allocator);
        seq.create();
        for (const item of arr) {
            seq.push(this.build(item, visited), { isPtr: true });
        }
        return seq.seal();
    }

    _buildMap(obj, visited) {
        const Dictionary = require('../../structure/dictionary/index.js');
        const dict = new Dictionary(this.allocator);
        dict.create();
        for (const key of Object.keys(obj)) {
            dict.set(key, this.build(obj[key], visited), { isPtr: true });
        }
        return dict.seal();
    }

    /**
     * B"H bulk-load (2026-11-12): builds a dictionary from entries in one
     * bulk pass (bottom-up, via Dictionary.bulkLoadEntries) instead of
     * per-key inserts. Each entry is {key, value} where value may be a JS
     * value (built via this.build) or a pre-built pointer Buffer (used
     * directly, so callers need not hold the raw values in memory).
     * Returns the IdentityAnchor pointer, so the result is a proper
     * LiveHandle container (traversable), unlike a raw Dictionary pointer
     * set via isPtr. Fresh-vessel bulk loads only.
     */
    buildBulkMap(entries, visited = new Map()) {
        const Dictionary = require('../../structure/dictionary/index.js');
        const anchor = new IdentityAnchor(this.db);
        const anchorPtr = anchor.create(constants.VAL_TYPE.DICTIONARY, Buffer.alloc(0));
        const dictEntries = (entries || []).map(entry => {
            const value = entry && Buffer.isBuffer(entry.value)
                ? entry.value
                : this.build(entry ? entry.value : null, visited);
            return { key: entry ? entry.key : '', value };
        });
        const dict = new Dictionary(this.allocator);
        const dictPtr = dict.bulkLoadEntries(dictEntries);
        anchor.update(constants.VAL_TYPE.DICTIONARY, dictPtr);
        return anchorPtr;
    }
}

module.exports = StructBuilder;
