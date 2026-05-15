
// B"H
/**
 * @file keys.js
 * @description Yields the names of the stars in the heaven.
 */
const constants = require('../../../../constants.js');
const Dictionary = require('../../../../structure/dictionary/index.js');
const MapEngine = require('../../../../structure/map/index.js');
const Sequence = require('../../../../structure/sequence/index.js');
const FlatObject = require('../../../../structure/flat/object/index.js');
const FlatArray = require('../../../../structure/flat/array/index.js');
const keysCodec = require('../../../../utils/binary/keys.js');
const PackedLive = require('../../../packed/liveObject.js');
const PackedArray = require('../../../packed/liveArray.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');

module.exports = function* yieldKeys(db, t, structPtr) {
    const T = constants.VAL_TYPE;
    if (t === T.PACKED_OBJECT) {
        for (const k of PackedLive.keys(db, SmartPointer.toBuffer(structPtr))) yield String(k);
    } else if (t === T.PACKED_ARRAY) {
        for (const k of PackedArray.keys(db, SmartPointer.toBuffer(structPtr))) yield k;
    } else if (t === T.DICTIONARY || t === T.OBJECT) { 
        for (const k of (new Dictionary(db.allocator, structPtr)).keys()) yield String(k); 
    } else if (t === T.MAP || t === T.JS_MAP) { 
        for (const item of (new MapEngine(db.allocator, structPtr)).range()) yield keysCodec.decode(item.key); 
    } else if (t === T.SEQUENCE || t === T.ARRAY || t === T.SET || t === T.JS_SET) { 
        const len = (new Sequence(db.allocator, structPtr)).length(); 
        for(let i=0; i<len; i++) yield i; 
    } else if (t === T.SMART_OBJECT) {
        for (const k of (new FlatObject(db.allocator, structPtr)).keys()) yield String(k);
    } else if (t === T.SMART_ARRAY) {
        const len = (new FlatArray(db.allocator, structPtr)).length();
        for(let i=0; i<len; i++) yield i;
    }
};
