
// B"H
/**
 * @file iteration.js
 * @description
 *  Manages the collection of keys, values, and entries from database handles synchronously.
 *  Every trace of async and await has been purged, leaving only pure unadulterated speed.
 *  It channels the infinite flow of data out of the sealed vessels into observable arrays.
 */

const HandleRegistry = require('../registry/handle.js');

module.exports = {
    /**
     * @method keys
     * @description Pulls all string keys from a dictionary or map.
     */
    keys(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul || !soul.reader) return [];
        const arr = [];
        for (const k of soul.reader.keys()) arr.push(k);
        return arr;
    },

    /**
     * @method values
     * @description Plucks every active value out of the sequence or map.
     */
    values(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul || !soul.reader) return [];
        const arr = [];
        for (const v of soul.reader.values()) arr.push(v);
        return arr;
    },

    /**
     * @method entries
     * @description Resolves both name and essence (key/value) together.
     */
    entries(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul || !soul.reader) return [];
        const arr = [];
        for (const e of soul.reader.entries()) arr.push(e);
        return arr;
    },

    *streamKeys(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.keys();
    },

    *streamValues(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.values();
    },

    *streamEntries(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.entries();
    },

    *range(db, handle, start, end) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.iter.range(start, end);
    }
};
