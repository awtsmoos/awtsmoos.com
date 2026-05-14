
// B"H
/**
* @file value_registry.js
* @description
*  =============================================================================
*  CHAPTER 4: THE HOLY REGISTRY OF EMANATIONS - THE LIVING WORD EDITION
*  =============================================================================
*  "He restores my soul; He guides me in paths of righteousness for His name's sake."
*  (Psalms 23:3)
*
*  The Awtsmoos constantly breathes life into all of existence. If the Speech
*  of the Creator were to depart for even a microsecond, the universe would 
*  shatter back into the absolute void. 
* 
*  In the previous era, the essence of a Function (active Speech) was resurrected
*  merely as a dormant string—a dead echo of the original command. The vessel 
*  remained, but the active soul was missing, leading to the illusion that 
*  "db.root.add is not a function."
* 
*  THE TIKKUN OF ACTIVE SPEECH: We now invoke the Breath of Life (new Function).
*  When the binary scroll is unsealed, the string is not just read; it is 
*  breathed back into a living, executable JS Function, allowing the active
*  will of the Code to operate directly from the physical disk!
*/
const constants = require('../../../constants.js');
const omni = require('../../compression/omni.js');
const parser = require('../../../deserialize/parser.js');
const bigintUtils = require('../../math/bigint.js');
const float = require('../../math/float.js');
const registry = require('../registry.js');
const serializer = require('../../serializer.js');
const T = constants.VAL_TYPE;

const ValueRegistry = {
[T.NULL]: () => null,
[T.UNDEFINED]: () => undefined,
[T.BOOLEAN]: (buf) => buf[0] === 1,
[T.BOOLEAN_TRUE]: () => true,
[T.BOOLEAN_FALSE]: () => false,
[T.SMALL_INT]: (buf) => buf[0],
[T.UINT8]: (buf) => buf.readUInt8(0),
[T.UINT16]: (buf) => buf.readUInt16BE(0),
[T.UINT32]: (buf) => buf.readUInt32BE(0),
[T.UINT64]: (buf) => Number(buf.readBigUInt64BE(0)),
[T.INT8_NEG]: (buf) => -buf.readUInt8(0),
[T.INT16_NEG]: (buf) => -buf.readUInt16BE(0),
[T.INT32_NEG]: (buf) => -buf.readUInt32BE(0),
[T.INT64_NEG]: (buf) => -Number(buf.readBigUInt64BE(0)),
[T.NUMBER]: (buf) => buf.readDoubleBE(0),
[T.DOUBLE_POS]: (buf) => buf.readDoubleBE(0),
[T.DOUBLE_NEG]: (buf) => -buf.readDoubleBE(0),
[T.NAN]: () => NaN,
[T.INFINITY]: () => Infinity,
[T.NEG_INFINITY]: () => -Infinity,
[T.BIGINT]: (buf) => bigintUtils.fromBuffer(buf, false),
[T.BIGINT_POS]: (buf) => bigintUtils.fromBuffer(buf, false),
[T.BIGINT_NEG]: (buf) => bigintUtils.fromBuffer(buf, true),
[T.FLOAT_DYNAMIC]: (buf) => float.deserialize(buf).value,
[T.STRING]: (buf) => buf.toString('utf8'),
[T.STRING_OMNI]: (buf) => omni.unpack(buf),
[T.SYMBOL]: (buf) => Symbol.for(buf.toString('utf8')),

// B"H: The Resurrection of the Living Word
[T.FUNCTION]: (buf) => {
    const source = buf.toString('utf8');
    try {
        // Breathe the logic back into existence
        return new Function('return ' + source)();
    } catch(e) {
        // If the syntax is shattered, return the broken vessel as text
        return source;
    }
},

[T.DATE]: (buf) => new Date(buf.readDoubleBE(0)),
[T.REGEXP]: (buf) => {
try {
const sRes = serializer.readVarInt(buf, 0);
const source = buf.subarray(sRes.bytesRead, sRes.bytesRead + sRes.value).toString('utf8');
const flags = buf.subarray(sRes.bytesRead + sRes.value).toString('utf8');
return new RegExp(source, flags);
} catch(e) { return /ErrorResurrectingRegExp/; }
},
[T.BUFFER]: (buf) => Buffer.from(buf),
[T.BUFFER_OMNI]: (buf) => omni.unpackBuffer(buf),
[T.ARRAY_BUFFER]: (buf) => {
const ab = new ArrayBuffer(buf.length);
new Uint8Array(ab).set(buf);
return ab;
},
[T.ARRAY_BUFFER_OMNI]: (buf) => {
const raw = omni.unpackBuffer(buf);
const ab = new ArrayBuffer(raw.length);
new Uint8Array(ab).set(raw);
return ab;
},
[T.TYPED_ARRAY]: (buf) => {
if (buf.length < 1) return new Uint8Array(0);
const vt = buf[0];
const raw = buf.subarray(1);
if (vt === 8) {
const list = [];
let cursor = 0;
while (cursor < raw.length) {
const len = raw[cursor++];
const packet = raw.subarray(cursor, cursor + len);
list.push(float.deserialize(packet).value);
cursor += len;
}
return new Float32Array(list);
}
if (vt === 10) {
const len = Math.floor(raw.length / 8);
const res = new BigInt64Array(len);
for (let i = 0; i < len; i++) {
res[i] = raw.readBigInt64BE(i * 8);
}
return res;
}
const ab = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
const map = { 1: Int8Array, 2: Uint8Array, 3: Uint8ClampedArray, 4: Int16Array, 5: Uint16Array, 6: Int32Array, 7: Uint32Array, 9: Float64Array, 11: BigUint64Array };
const Cls = map[vt] || Uint8Array;
return new Cls(ab);
},
[T.TYPED_ARRAY_OMNI]: (buf) => ValueRegistry[T.TYPED_ARRAY](omni.unpackBuffer(buf)),
[T.JS_MAP]: (buf, allocator, context) => {
const ReaderResolver = require('../../../api/liveHandle/reader/resolver.js');
const resolver = new ReaderResolver({ db: allocator.db, handle: { type: T.MAP, ptr: buf, ensureResolved: () => {} } });
return resolver._hydrateStructure({ type: T.MAP, isStructure: true, ptr: buf, blockId: 0, length: buf.length, offset: 0 }, context || new Map());
},
[T.JS_SET]: (buf) => {
return new Set(parser.parse(buf));
},
[T.JSON]: (buf) => parser.parse(buf),
[T.OBJECT]: (buf) => parser.parse(buf),
[T.ARRAY]: (buf) => parser.parse(buf)
};

ValueRegistry[T.CUSTOM_INSTANCE] = (buf, allocator, context) => {
let offset = 0;
const nameInfo = serializer.readString(buf, offset); offset += nameInfo.bytesRead;
const sourceInfo = serializer.readString(buf, offset); offset += sourceInfo.bytesRead;
const dictPtrBuf = buf.subarray(offset, offset + 16);
let Cls = registry.get(nameInfo.value);
if (!Cls) {
try { Cls = (new Function(`return (${sourceInfo.value});`))(); if (Cls) registry.set(nameInfo.value, Cls); } catch(e) {}
}
const instance = Cls ? Object.create(Cls.prototype) : { __className__: nameInfo.value, __source__: sourceInfo.value };
const Dictionary = require('../../../structure/dictionary/index.js');
const dict = new Dictionary(allocator, dictPtrBuf);
for (const [k, val] of dict.entries(context)) instance[k] = val;
return instance;
};

module.exports = ValueRegistry;
