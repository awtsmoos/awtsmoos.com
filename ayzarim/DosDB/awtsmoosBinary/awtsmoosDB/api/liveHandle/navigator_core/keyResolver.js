
// B"H
/**
 * @file keyResolver.js
 * @description Descends into a specific exact-byte dimensional block.
 */
const constants = require('../../../constants.js');
const DictionarySeeker = require('../../../structure/dictionary/seeker.js');
const MapSeeker = require('../../../structure/map/seeker.js');
const Sequence = require('../../../structure/sequence/index.js');
const FlatObjectSeeker = require('../../../structure/flat/object/seeker.js');
const FlatArray = require('../../../structure/flat/array/index.js');
const keys = require('../../../utils/binary/keys.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');

module.exports = {
    resolve(handle, db, k, ptr) {
        let vp; 
        const T = constants.VAL_TYPE;
        let type = handle.type;
        
        // B"H: If the vessel is an Anchor, unveil its true nature before searching.
        if (type === T.ANCHOR) {
            const Anchor = require('../../../structure/anchor/stable.js');
            const anchorManager = new Anchor(db);
            const resolved = anchorManager.resolve(handle.ptr);
            if (resolved) type = resolved.type;
            else type = T.DICTIONARY; // Fallback
        }
        
        if (type === T.SMART_OBJECT) {
            vp = FlatObjectSeeker.get(db, ptr, k);
        } else if (type === T.SMART_ARRAY) {
            const flat = new FlatArray(db.allocator, ptr);
            const idx = parseInt(k);
            vp = flat.get(idx);
            if (!vp && db.sparseArrays) vp = db.sparseArrays.getPtr(handle, idx);
        } else if (type === T.SEQUENCE || type === T.ARRAY || type === T.SET || type === T.JS_SET) {
            const idx = parseInt(k);
            if (!isNaN(idx)) {
                const engine = new Sequence(db.allocator, ptr);
                vp = engine.getPtr(idx);
                if (!vp && db.sparseArrays) vp = db.sparseArrays.getPtr(handle, idx);
            }
        } else {
            const ek = keys.encode(k);
            if (type === T.MAP || type === T.JS_MAP) {
                vp = MapSeeker.get(db, ptr, ek);
            } else {
                vp = DictionarySeeker.get(db, ptr, ek);
            }
        }
        return vp ? { ptr: vp, type: SmartPointer.getType(vp) } : null;
    }
};
