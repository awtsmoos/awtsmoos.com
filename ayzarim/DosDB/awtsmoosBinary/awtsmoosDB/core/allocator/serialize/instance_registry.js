
// B"H
/**
 * @file instance_registry.js
 * @description The Behemoth and Leviathan of Complex Forms.
 */

const constants = require("../../../constants.js");
const Packers = require("./typed_arrays/packers.js");

const TypedArrayMap = {
    'Int8Array': { id: 1, write: (val) => Buffer.from(val.buffer, val.byteOffset, val.byteLength) },
    'Uint8Array': { id: 2, write: (val) => Buffer.from(val.buffer, val.byteOffset, val.byteLength) },
    'Uint8ClampedArray': { id: 3, write: (val) => Buffer.from(val.buffer, val.byteOffset, val.byteLength) },
    'Int16Array': { id: 4, write: (val) => Buffer.from(val.buffer, val.byteOffset, val.byteLength) },
    'Uint16Array': { id: 5, write: (val) => Buffer.from(val.buffer, val.byteOffset, val.byteLength) },
    'Int32Array': { id: 6, write: (val) => Buffer.from(val.buffer, val.byteOffset, val.byteLength) },
    'Uint32Array': { id: 7, write: (val) => Buffer.from(val.buffer, val.byteOffset, val.byteLength) },
    
    // Exact Float Packing
    'Float32Array': { id: 8, write: Packers.packFloats },
    'Float64Array': { id: 9, write: Packers.packFloats },
    
    // Generational BigInt Packing
    'BigInt64Array': { id: 10, write: Packers.packBigInts },
    'BigUint64Array': { id: 11, write: Packers.packBigInts }
};

function getInstanceRegistry(objModule, arrModule) {
    return [
        {
            check: (val) => val === null,
            process: () => ({ type: constants.VAL_TYPE.NULL, data: null })
        },
        {
            check: (val) => val instanceof Date,
            process: (val) => {
                const b = Buffer.allocUnsafe(8);
                b.writeDoubleBE(val.getTime());
                return { type: constants.VAL_TYPE.DATE, data: b };
            }
        },
        {
            check: (val) => val instanceof RegExp,
            process: (val) => {
                const sourceBuf = Buffer.from(val.source, 'utf8');
                const flagsBuf = Buffer.from(val.flags, 'utf8');
                const data = Buffer.concat([
                    objModule.localWriteVarInt(sourceBuf.length), 
                    sourceBuf, 
                    flagsBuf
                ]);
                return { type: constants.VAL_TYPE.REGEXP, data };
            }
        },
        {
            // B"H: A native Map nested deep inside a structure becomes a JS_MAP
            check: (val) => val instanceof Map,
            process: (val) => ({ type: constants.VAL_TYPE.JS_MAP, data: arrModule(Array.from(val.entries())) })
        },
        {
            // B"H: A native Set becomes a JS_SET
            check: (val) => val instanceof Set,
            process: (val) => ({ type: constants.VAL_TYPE.JS_SET, data: arrModule(Array.from(val.values())) })
        },
        {
            check: (val) => val instanceof Error,
            process: (val) => ({
                type: constants.VAL_TYPE.ERROR,
                data: objModule.serializeJSON({ 
                    name: val.name, 
                    message: val.message, 
                    stack: val.stack, 
                    cause: val.cause,
                    errors: val.errors
                })
            })
        },
        {
            // B"H: The Unserializables - Protected from shattering
            check: (val) => val instanceof WeakMap || val instanceof WeakSet || val instanceof Promise,
            process: (val) => ({
                type: constants.VAL_TYPE.OBJECT,
                data: objModule.serializeJSON({ __unserializable__: val.constructor.name })
            })
        },
        {
            // B"H: Internationalization formats
            check: (val) => typeof val === 'object' && val !== null && val.constructor && val.constructor.name.startsWith('Intl.'),
            process: (val) => ({
                type: constants.VAL_TYPE.OBJECT,
                data: objModule.serializeJSON({ __intl__: val.constructor.name })
            })
        },
        {
            // B"H: Universal Resource Locators
            check: (val) => typeof URL !== 'undefined' && val instanceof URL,
            process: (val) => ({
                type: constants.VAL_TYPE.OBJECT,
                data: objModule.serializeJSON({ __url__: val.href })
            })
        },
        {
            // B"H: URL Parameters
            check: (val) => typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams,
            process: (val) => ({
                type: constants.VAL_TYPE.OBJECT,
                data: objModule.serializeJSON({ __urlsearchparams__: val.toString() })
            })
        },
        {
            check: (val) => ArrayBuffer.isView(val) && !Buffer.isBuffer(val),
            process: (val) => {
                const def = TypedArrayMap[val.constructor.name];
                const vt = def ? def.id : 2;
                const raw = def ? def.write(val) : Buffer.from(val.buffer, val.byteOffset, val.byteLength);
                return { 
                    type: constants.VAL_TYPE.TYPED_ARRAY, 
                    data: Buffer.concat([Buffer.from([vt]), raw]) 
                };
            }
        },
        {
            check: (val) => val instanceof ArrayBuffer,
            process: (val) => ({ type: constants.VAL_TYPE.ARRAY_BUFFER, data: Buffer.from(val) })
        },
        {
            check: (val) => Buffer.isBuffer(val),
            process: (val) => ({ type: constants.VAL_TYPE.BUFFER, data: val })
        },
        {
            check: (val) => Array.isArray(val),
            process: (val) => ({ type: constants.VAL_TYPE.ARRAY, data: arrModule(val) })
        }
    ];
}

module.exports = getInstanceRegistry;
