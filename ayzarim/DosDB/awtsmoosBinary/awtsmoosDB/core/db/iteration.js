//B"H

/**
 * @file iteration.js
 * @description
 *  Manages the streaming and collection of keys, values, and entries from database handles.
 */

const HandleRegistry = require('../handleRegistry.js');

module.exports = {
    async keys(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul || !soul.reader) return [];
        const arr = [];
        for await (const k of soul.reader.keys()) arr.push(k);
        return arr;
    },

    async values(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul || !soul.reader) return [];
        const arr = [];
        for await (const v of soul.reader.values()) arr.push(v);
        return arr;
    },

    async entries(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul || !soul.reader) return [];
        const arr = [];
        for await (const e of soul.reader.entries()) arr.push(e);
        return arr;
    },

    async *streamKeys(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.keys();
    },

    async *streamValues(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.values();
    },

    async *streamEntries(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.entries();
    },

    async *range(db, handle, start, end) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.range(start, end);
    }
};