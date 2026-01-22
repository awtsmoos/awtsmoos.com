// B"H
const constants = require('../../constants.js');
const parser = require('../../deserialize/parser.js');
const serializer = require('../serializer.js');
const codec = require('./codec.js');
const registry = require('./registry.js');
const keyEncoding = require('../keyEncoding.js');
const bigIntUtils = require('../bigIntUtils.js');
const floatHandler = require('../floatHandler.js');
const stringPacker = require('../stringPacker.js');
const { readPointer48 } = require('../binaryHelpers.js');

module.exports = async function decodeValue(type, buffer, allocator, context, ctxKey, SmartPointer) {
    if (!buffer) return undefined;
    const T = constants.VAL_TYPE;
    
    // Container Rehydration from Heap/Blobs
    if (type === T.MAP) {
        const parsed = parser.parse(buffer);
        if (Array.isArray(parsed)) {
            for(let i=0; i<parsed.length; i++) {
                if (Array.isArray(parsed[i]) && Buffer.isBuffer(parsed[i][0])) {
                    parsed[i][0] = parsed[i][0].toString('utf8');
                }
            }
            return new Map(parsed);
        }
        return new Map();
    }
    // B"H: Fixed Set Rehydration
    if (type === T.SET) {
        const parsed = parser.parse(buffer);
        // parser.parse returns an Array for T.ARRAY/T.SET structure structure
        return Array.isArray(parsed) ? new Set(parsed) : new Set();
    }
    if (type === T.ARRAY) return parser.parse(buffer);
    if (type === T.OBJECT) return parser.parse(buffer);
    
    // Core Scalars
    if (type === T.BOOLEAN || type === T.BOOLEAN_TRUE || type === T.BOOLEAN_FALSE) return buffer.length > 0 && buffer[0] === 1;
    if (type === T.STRING) return buffer.toString('utf8');
    if (type === T.BUFFER) return buffer;
    if (type === T.BIGINT_POS) return bigIntUtils.fromBuffer(buffer, false);
    if (type === T.BIGINT_NEG) return bigIntUtils.fromBuffer(buffer, true);
    if (type === T.SYMBOL) return Symbol.for(buffer.toString('utf8'));
    
    if (type === T.FUNCTION) {
        const source = buffer.toString('utf8');
        try {
            return (new Function('return ' + source))();
        } catch(e) {
            return source;
        }
    }
    
    if (type === T.DATE) return new Date(buffer.readDoubleBE(0));
    
    if (type === T.REGEXP) {
        try {
            const sRes = serializer.readVarInt(buffer, 0);
            const source = buffer.toString('utf8', sRes.bytesRead, sRes.bytesRead + sRes.value);
            const flags = buffer.toString('utf8', sRes.bytesRead + sRes.value);
            return new RegExp(source, flags);
        } catch(e) { return /ErrorDecodingRegExp/; }
    }

    if (type === T.ERROR) {
        try {
            const rawObj = parser.parse(buffer);
            let e;
            
            if (rawObj.isAggregate) {
                e = new AggregateError(rawObj.errors || [], rawObj.message);
            } else {
                if (rawObj.name === 'RangeError') e = new RangeError(rawObj.message);
                else if (rawObj.name === 'TypeError') e = new TypeError(rawObj.message);
                else if (rawObj.name === 'ReferenceError') e = new ReferenceError(rawObj.message);
                else if (rawObj.name === 'SyntaxError') e = new SyntaxError(rawObj.message);
                else if (rawObj.name === 'URIError') e = new URIError(rawObj.message);
                else if (rawObj.name === 'EvalError') e = new EvalError(rawObj.message);
                else e = new Error(rawObj.message);
            }
            e.name = rawObj.name;
            if (rawObj.stack) e.stack = rawObj.stack;
            if (rawObj.cause) e.cause = rawObj.cause;
            return e;
        } catch(err) { 
            return new Error("B\"H: Error decoding failed: " + err.message); 
        }
    }

    if (type === T.CUSTOM_INSTANCE) {
        let offset = 0;
        const nameInfo = serializer.readString(buffer, offset); offset += nameInfo.bytesRead;
        const sourceInfo = serializer.readString(buffer, offset); offset += sourceInfo.bytesRead;
        const dictPtrBuf = buffer.subarray(offset, offset + 16);
        
        let Cls = registry.get(nameInfo.value);
        if (!Cls) {
            try { 
                Cls = (new Function(`return (${sourceInfo.value});`))(); 
                if (Cls) registry.set(nameInfo.value, Cls); 
            } catch(e) {}
        }
        
        const dictDecoded = codec.decode(dictPtrBuf);
        if (!dictDecoded) throw new Error("B\"H: Corrupt Custom Instance Pointer");

        const Dictionary = require('../../structure/dictionary/index.js');
        const dict = new Dictionary(allocator, { 
            blockId: readPointer48(dictDecoded.payload, 0), 
            length: dictDecoded.payload.readUInt32BE(6), 
            offset: dictDecoded.payload.readUInt32BE(10), 
            isChain: dictDecoded.payload.readUInt8(14) === 1 
        });
        
        let instance = Cls ? Object.create(Cls.prototype) : { __className__: nameInfo.value, __source__: sourceInfo.value };
        if (ctxKey) context.set(ctxKey, instance);
        
        const Reader = require('../../api/liveHandle/reader.js');
        const Navigator = require('../../api/liveHandle/navigator.js');
        
        const mockHandle = {
            db: allocator.v1.db,
            ensureResolved: async () => {},
            getPath: () => 'resurrection_vessel',
            isLiveHandle: true
        };
        mockHandle.nav = new Navigator(mockHandle);
        const reader = new Reader(mockHandle);
        
        for await (const [k, val] of dict.entries(context)) {
            const realKey = keyEncoding.decode(k);
            if (val && val.isStructure) {
                instance[realKey] = await reader._hydrateStructure(val, context);
            } else {
                instance[realKey] = val;
            }
        }
        return instance;
    }

    if (type === T.TYPED_ARRAY) {
        const viewType = buffer[0]; const raw = buffer.subarray(1);
        const ab = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
        switch(viewType) {
            case 1: return new Int8Array(ab); case 2: return new Uint8Array(ab); case 4: return new Int16Array(ab);
            case 5: return new Uint16Array(ab); case 6: return new Int32Array(ab); case 7: return new Uint32Array(ab);
            case 8: return new Float32Array(ab); case 9: return new Float64Array(ab); case 10: return new BigInt64Array(ab);
            case 11: return new BigUint64Array(ab); default: return new Uint8Array(ab);
        }
    }
    
    return buffer;
};