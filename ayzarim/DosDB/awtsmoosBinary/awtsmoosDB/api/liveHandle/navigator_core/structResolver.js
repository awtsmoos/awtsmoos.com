
// B"H
/**
 * @file structResolver.js
 * @description Extracts the physical anchor coordinates from the deep void.
 */
const SmartPointer = require('../../../utils/smartPointer/index.js');
const HandleRegistry = require('../../../core/registry/handle.js');
const constants = require('../../../constants.js');

module.exports = {
    resolve(handle, db) {
        // B"H: Pluck the physical offset/length of the data, not the Anchor itself.
        if (handle.type === constants.VAL_TYPE.ANCHOR) {
            const Anchor = require('../../../structure/anchor/stable.js');
            const anchorManager = new Anchor(db);
            const resolved = anchorManager.resolve(handle.ptr);
            if (resolved) return { offset: resolved.offset, length: resolved.length };
            return null;
        }

        if (handle.ptr) {
            const dec = SmartPointer.decode(handle.ptr);
            if (dec) return { offset: dec.offset, length: dec.length };
        }
        if (db.root && handle === HandleRegistry.getSoul(db.root) && db.rootPtrRaw) {
             const dec = SmartPointer.decode(db.rootPtrRaw);
             if (dec) return { offset: dec.offset, length: dec.length };
        }
        return null;
    }
};
