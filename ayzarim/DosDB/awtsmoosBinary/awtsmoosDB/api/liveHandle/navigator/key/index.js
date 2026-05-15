
// B"H
/**
 * @file index.js (Key Logic)
 * @chapter The Book of Names (Shemos)
 */

const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');
const AnchorLogic = require('../anchor/index.js');
const FlatSeeker = require('./flat/index.js');
const SequenceSeeker = require('./sequence/index.js');
const MapSeeker = require('./map/index.js');
const PackedLive = require('../../../packed/liveObject.js');
const PackedArray = require('../../../packed/liveArray.js');

class KeyLogic {
    static resolveKey(state, key, structCoords) {
        const T = constants.VAL_TYPE;
        let type = state.type;

        if (type === T.ANCHOR) {
            type = AnchorLogic.resolveInnerType(state) || T.DICTIONARY;
        }

        const db = state.db;
        let valPtr = null;

        if (type === T.PACKED_OBJECT) {
            const out = PackedLive.get(db, state.ptr, key);
            return out.hit ? { virtualPacked: true, value: out.value } : null;
        }
        if (type === T.PACKED_ARRAY) {
            const out = PackedArray.get(db, state.ptr, key);
            return out.hit ? { virtualPacked: true, value: out.value } : null;
        }
        if (type === T.PACKED_ARRAY) {
            const out = PackedArray.get(db, state.ptr, key);
            return out.hit ? { virtualPacked: true, value: out.value } : null;
        }

        if (type === T.SMART_OBJECT || type === T.SMART_ARRAY) {
            valPtr = FlatSeeker.seek(db, type, structCoords, key);
            if (!valPtr && type === T.SMART_ARRAY && db.sparseArrays) {
                valPtr = db.sparseArrays.getPtr(state, key);
            }
        } else if ([T.SEQUENCE, T.ARRAY, T.SET, T.JS_SET].includes(type)) {
            valPtr = SequenceSeeker.seek(db, structCoords, key);
            if (!valPtr && db.sparseArrays) valPtr = db.sparseArrays.getPtr(state, key);
        } else {
            valPtr = MapSeeker.seek(db, type, structCoords, key);
        }

        if (!valPtr) return null;

        return {
            ptr: valPtr,
            type: SmartPointer.getType(valPtr)
        };
    }
}

module.exports = KeyLogic;
