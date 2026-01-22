//B"H

/**
 * @file iteration.js
 * @description
 *  Manages the collection of keys, values, and entries from database handles synchronously.
 *  Every trace of async and await has been purged.
 */

const HandleRegistry = require('../handleRegistry.js');

module.exports = {
    keys(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul || !soul.reader) return [];
        const arr = [];
        for (const k of soul.reader.keys()) arr.push(k);
        return arr;
    },

    values(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul || !soul.reader) return [];
        const arr = [];
        for (const v of soul.reader.values()) arr.push(v);
        return arr;
    },

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