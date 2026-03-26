
// B"H
const constants = require("../../../constants.js");
const Packers = require("../serialize/typed_arrays/packers.js");

const TypedArrayMap = {
    'Int8Array': 1, 'Uint8Array': 2, 'Uint8ClampedArray': 3,
    'Int16Array': 4, 'Uint16Array': 5, 'Int32Array': 6, 'Uint32Array': 7,
    'Float32Array': 8, 'Float64Array': 9, 'BigInt64Array': 10, 'BigUint64Array': 11
};

module.exports = function getInstanceRegistry(objModule, arrModule) {
    return [
        { check: (val) => val === null, process: () => ({ type: constants.VAL_TYPE.NULL, data: null }) },
        { check: (val) => val instanceof Date, process: (val) => {
            const b = Buffer.allocUnsafe(8); b.writeDoubleBE(val.getTime());
            return { type: constants.VAL_TYPE.DATE, data: b };
        }},
        { check: (val) => ArrayBuffer.isView(val) && !Buffer.isBuffer(val), process: (val) => {
            const vt = TypedArrayMap[val.constructor.name] || 2;
            let raw;
            if (vt >= 8 && vt <= 11) {
                raw = (vt === 8 || vt === 9) ? Packers.packFloats(val) : Packers.packBigInts(val);
            } else {
                raw = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
            }
            return { type: constants.VAL_TYPE.TYPED_ARRAY, data: Buffer.concat([Buffer.from([vt]), raw]) };
        }},
        { check: (val) => val instanceof ArrayBuffer, process: (val) => ({ type: constants.VAL_TYPE.ARRAY_BUFFER, data: Buffer.from(val) }) },
        { check: (val) => Buffer.isBuffer(val), process: (val) => ({ type: constants.VAL_TYPE.BUFFER, data: val }) },
        { check: (val) => Array.isArray(val), process: (val) => ({ type: constants.VAL_TYPE.ARRAY, data: arrModule(val) }) }
    ];
};
