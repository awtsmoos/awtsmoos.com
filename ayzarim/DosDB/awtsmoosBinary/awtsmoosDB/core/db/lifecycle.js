// B"H
/**
 * @file lifecycle.js
 * @description Governing the Genesis and Histalkus of the Database.
 * REWRITTEN: Fixes the existing DB detection logic to prevent accidental Genesis (overwriting).
 */

const constants = require('../../constants.js');
const Dictionary = require('../../structure/dictionary/index.js');
const { readPointer48, writePointer48 } = require('../../utils/binaryHelpers.js');
const HandleRegistry = require('../handleRegistry.js');
const SmartPointer = require('../../utils/smartPointer.js');
const fs = require('fs');

function log(msg) {
    try { fs.writeSync(2, `\x1b[36mB"H [LIFECYCLE] ${msg}\x1b[0m\n`); } catch(e) {}
}

module.exports = {
    /**
     * @description Awakens the database and ensures the Root Anchor is recognized.
     */
    open(db) {
        log(`Awakening foundation: ${db.pager.filePath}`);
        db.pager.init();
        db.allocator.init();

        // 1. Read Block 0 (The SuperBlock)
        let sb = db.pager.readBlock(0);
        
        // B"H: AUTHORITATIVE DETECTION
        // We check two things: 
        // 1. Is the Cursor at offset 128 valid (>= 2)?
        // 2. Is there a non-zero Root ID at offset 64?
        const savedCursor = readPointer48(sb, 128);
        const rootId = readPointer48(sb, 64);
        
        const isActuallyNew = (savedCursor < 2) && (rootId === 0);

        let rootPtrRaw = null;

        if (isActuallyNew) {
            log("Genesis: Manifesting Absolute Root Dictionary from the Void...");
            
            // Format SuperBlock Cursor
            db.allocator.v1.updateSuperBlock((block) => {
                block.fill(0);
                writePointer48(block, 2, 128); 
            });

            // Create the first physical Dictionary
            const dict = new Dictionary(db.allocator.v1);
            rootPtrRaw = dict.create(); 
            
            // Seal Root Anchor into Block 0
            const dec = SmartPointer.decode(rootPtrRaw);
            db.allocator.v1.updateSuperBlock((block) => {
                writePointer48(block, readPointer48(dec.payload, 0), 64);
                block.writeUInt32BE(dec.payload.readUInt32BE(6), 70);
                block.writeUInt32BE(dec.payload.readUInt32BE(10), 74);
                block.writeUInt8(dec.payload.readUInt8(14), 78);
            });
            
            db.rootPtrRaw = rootPtrRaw;
            db.pager.fsync(); 
        } else {
            // RECOGNITION: The world already exists.
            const rootLen = sb.readUInt32BE(70);
            const rootOff = sb.readUInt32BE(74);
            const rootChain = sb.readUInt8(78);
            
            log(`Recognition: Root located at block ${rootId} offset ${rootOff}. Cursor: ${savedCursor}`);
            rootPtrRaw = SmartPointer.block(constants.VAL_TYPE.DICTIONARY, rootId, rootLen, rootChain === 1, rootOff);
            db.rootPtrRaw = rootPtrRaw;
        }

        // Hydrate Root handle
        const soul = HandleRegistry.getSoul(db.root);
        if (soul) {
            soul.ptr = rootPtrRaw;
            soul.type = constants.VAL_TYPE.DICTIONARY;
            soul.lastMutationCount = -1; 
            soul.ensureResolved(true);
        }
    },

    close(db) {
        log("Tzimtzum: Closing the gates.");
        db.pager.close();
    }
};