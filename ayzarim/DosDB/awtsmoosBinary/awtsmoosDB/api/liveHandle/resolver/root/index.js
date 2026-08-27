
// B"H
/**
 * @file index.js (Root)
 * @chapter The Apex of Keter
 * @description
 * Ensures the Root Handle is always perfectly aligned with the Superblock's physical truth.
 */

const SmartPointer = require('../../../../utils/smartPointer/index.js');

class RootResolver {
    static resolve(state, db) {
        if (db.rootPtrRaw) {
            if (!state.ptr || Buffer.compare(state.ptr, db.rootPtrRaw) !== 0) {
                state.ptr = db.rootPtrRaw;
                const dec = SmartPointer.decode(state.ptr);
                if (dec) state.type = dec.type;
            }
        }
    }
}

module.exports = RootResolver;
