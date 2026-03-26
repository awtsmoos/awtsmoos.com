
// B"H
/**
 * @file operations.js
 * @description
 *  Defines the primary interactions with the database handles.
 *  Just as the Creator directs His energies to specific realms,
 *  these operations target specific vessels of truth.
 */

const HandleRegistry = require('../registry/handle.js');

module.exports = {
    set(db, key, value) {
        db.ensureOpen();
        return db.root.set(key, value);
    },

    get(db, key) {
        db.ensureOpen();
        return db.root[key];
    },

    has(db, handle, key) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul) return false;
        soul.ensureResolved();
        return (soul.nav.resolveKey(key)) !== null;
    },

    compact(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (soul && soul.writer) return soul.writer.compact();
    },

    size(db, handle) {
        const soul = HandleRegistry.getSoul(handle);
        if (!soul || !soul.reader) return 0;
        return soul.reader.length();
    }
};
