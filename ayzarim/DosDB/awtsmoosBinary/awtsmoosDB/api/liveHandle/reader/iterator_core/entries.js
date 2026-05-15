
// B"H
/**
 * @file entries.js
 * @description Yields both the vessel name and its light simultaneously.
 */
const constants = require('../../../../constants.js');
const Dictionary = require('../../../../structure/dictionary/index.js');
const MapEngine = require('../../../../structure/map/index.js');
const Sequence = require('../../../../structure/sequence/index.js');
const FlatObject = require('../../../../structure/flat/object/index.js');
const FlatArray = require('../../../../structure/flat/array/index.js');
const keysCodec = require('../../../../utils/binary/keys.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');
const PackedLive = require('../../../packed/liveObject.js');
const PackedArray = require('../../../packed/liveArray.js');

module.exports = function* yieldEntries(reader, db, t, structPtr) {
    const T = constants.VAL_TYPE;
    if (t === T.PACKED_OBJECT) {
        const obj = PackedLive.readObject(db, SmartPointer.toBuffer(structPtr)) || {};
        for (const k of Object.keys(obj)) yield [String(k), obj[k]];
    } else if (t === T.PACKED_ARRAY) {
        const arr = PackedArray.readArray(db, SmartPointer.toBuffer(structPtr)) || [];
        for (let i = 0; i < arr.length; i++) yield [i, arr[i]];
    } else if (t === T.DICTIONARY || t === T.OBJECT) {
        for (const [k, v] of (new Dictionary(db.allocator, structPtr)).entries()) {
            yield [String(k), reader._wrapIfNeeded(v, String(k))];
        }
    } else if (t === T.MAP || t === T.JS_MAP) {
        const map = new MapEngine(db.allocator, structPtr);
        for (const item of map.range()) {
            const k = keysCodec.decode(item.key);
            const val = reader._wrapIfNeeded(SmartPointer.resolve(item.ptr, db.allocator), k, item.ptr);
            const entry = [k, val]; entry.key = k; entry.value = val; yield entry;
        }
    } else if (t === T.SEQUENCE || t === T.ARRAY || t === T.SET || t === T.JS_SET) {
        const seq = new Sequence(db.allocator, structPtr);
        for(let i=0; i<seq.length(); i++) { 
            const ptr = seq.getPtr(i); 
            yield [i, reader._wrapIfNeeded(SmartPointer.resolve(ptr, db.allocator), i, ptr)]; 
        }
    } else if (t === T.SMART_OBJECT) {
        const obj = new FlatObject(db.allocator, structPtr);
        for (const [k, v] of obj.entries()) {
            yield [k, reader._wrapIfNeeded(v, k)];
        }
    } else if (t === T.SMART_ARRAY) {
        const arr = new FlatArray(db.allocator, structPtr);
        const len = arr.length();
        for(let i=0; i<len; i++) {
            const ptr = arr.get(i);
            const val = SmartPointer.resolve(ptr, db.allocator);
            yield [i, reader._wrapIfNeeded(val, i, ptr)];
        }
    }
};
