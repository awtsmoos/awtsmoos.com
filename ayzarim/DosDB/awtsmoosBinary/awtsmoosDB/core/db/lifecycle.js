//B"H

/**
 * @file lifecycle.js
 * @description
 *  Manages the opening and closing of the database vessels.
 */

const constants = require('../../constants.js');
const Dictionary = require('../../structure/dictionary/index.js');
const { readPointer48, writePointer48 } = require('../../utils/binaryHelpers.js');
const HandleRegistry = require('../handleRegistry.js');
const SmartPointer = require('../../utils/smartPointer.js');

module.exports = {
    /**
     * @description Opens the database, resolves the root pointer, and preloads caches.
     */
    open: async (db) => {
        await db.pager.init();
        await db.allocator.init();

        const sb = await db.allocator.v1.readBlockLocked(0);
        const savedRootId = readPointer48(sb, 64);
        const savedRootLen = sb.readUInt32BE(70);
        const savedRootOff = sb.readUInt32BE(74);
        const savedRootChain = sb.readUInt8(78);

        await db.batch(async () => {
            if (savedRootId === 0) {
                const dict = new Dictionary(db.allocator);
                const rootPtr = await dict.create(); 
                const decoded = SmartPointer.decode(rootPtr);
                await db.allocator.v1.updateSuperBlock((block) => {
                    writePointer48(block, readPointer48(decoded.payload, 0), 64);
                    block.writeUInt32BE(decoded.payload.readUInt32BE(6), 70);
                    block.writeUInt32BE(decoded.payload.readUInt32BE(10), 74);
                    block.writeUInt8(decoded.payload.readUInt8(14), 78);
                });
                db.rootPtrRaw = rootPtr;
            } else {
                db.rootPtrRaw = SmartPointer.block(constants.TYPE_DICTIONARY, savedRootId, savedRootLen, savedRootChain === 1, savedRootOff);
            }

            db.root = HandleRegistry.createHandle(db, db.rootPtrRaw, constants.TYPE_DICTIONARY, null);
            
            // Internal System Setup
            const sysMaps = ["__sys_vector__", "__sys_search__", "__graph__", "ai"];
            for (const name of sysMaps) {
                if (!await db.has(db.root, name)) await db.createMap(db.root, name);
            }

            // Preload Caches
            if (await db.has(db.root, "__sys_search__")) {
                for await (const k of db.streamKeys(db.root.__sys_search__)) db.sysCache.search.add(k);
            }
            if (await db.has(db.root, "__sys_vector__")) {
                for await (const k of db.streamKeys(db.root.__sys_vector__)) {
                    if (!k.startsWith("__")) db.sysCache.vector.add(k);
                }
            }
            db.sysCache.loaded = true;
        });
    },

    /**
     * @description Gracefully closes the database after ensuring all sparks are gathered (tasks flushed).
     */
    close: async (db) => {
        await db.waitForIdle(); 
        await db.pager.close();
        db.root = null;
    }
};