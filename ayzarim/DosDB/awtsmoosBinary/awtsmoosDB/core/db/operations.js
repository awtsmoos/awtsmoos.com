//B"H

/**
 * @file operations.js
 * @description
 *  Defines the primary interactions with the database handles.
 *  Vessels are now manifested via idiomatic assignment.
 */

const HandleRegistry = require('../handleRegistry.js');

module.exports = {
    async set(db, key, value) {
        await db.ensureOpen();
        return await db.root.set(key, value);
    },

    async get(db, key) {
        await db.ensureOpen();
        return await db.root[key];
    },

    async has(db, handle, key) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul) return false;
        await soul.ensureResolved();
        return (await soul.nav.resolveKey(key)) !== null;
    },

    async compact(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.writer) return await soul.writer.compact();
    },

    async concat(db, handle, otherHandle) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.writer) return await soul.writer.concat(otherHandle);
    },

    async stats(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul || !soul.reader) return { count: 0, size: 0, capacity: 0, fragmentation: 0 };
        return await soul.reader.stats();
    },

    async size(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul || !soul.reader) return 0;
        return await soul.reader.length();
    }
};