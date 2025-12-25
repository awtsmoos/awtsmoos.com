//B"H

/**
 * @file operations.js
 * @description
 *  Defines the primary interactions with the database handles.
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

    async createMap(db, handle, key) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.writer) await soul.writer.createMap(key);
    },

    async createList(db, handle, key) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.writer) await soul.writer.createList(key);
    },

    async createObject(db, handle, key) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.writer) await soul.writer.createObject(key);
    },

    async compact(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.writer) return await soul.writer.compact();
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