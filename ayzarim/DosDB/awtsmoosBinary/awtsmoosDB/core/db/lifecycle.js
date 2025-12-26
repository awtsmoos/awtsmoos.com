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
     * @description Recovers the root pointer and pre-allocates system vessels.
     */
    open(db) {
        db.pager.init();
        db.allocator.init();

        const sb = db.allocator.v1.readBlockLocked(0);
        const savedRootId = readPointer48(sb, 64);
        const savedRootLen = sb.readUInt32BE(70);
        const savedRootOff = sb.readUInt32BE(74);
        const savedRootChain = sb.readUInt8(78);

        if (savedRootId === 0) {
            const dict = new Dictionary(db.allocator);
            const rootPtr = dict.create(); 
            const decoded = SmartPointer.decode(rootPtr);
            db.allocator.v1.updateSuperBlock((block) => {
                writePointer48(block, readPointer48(decoded.payload, 0), 64);
                block.writeUInt32BE(decoded.payload.readUInt32BE(6), 70);
                block.writeUInt32BE(decoded.payload.readUInt32BE(10), 74);
                block.writeUInt8(decoded.payload.readUInt8(14), 78);
            });
            db.rootPtrRaw = rootPtr;
        } else {
            db.rootPtrRaw = SmartPointer.block(constants.VAL_TYPE.DICTIONARY, savedRootId, savedRootLen, savedRootChain === 1, savedRootOff);
        }

        db.root = HandleRegistry.createHandle(db, db.rootPtrRaw, constants.VAL_TYPE.DICTIONARY, null);
    },

    close(db) {
        db.pager.close();
        db.root = null;
    }
};