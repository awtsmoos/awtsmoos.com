// B"H
/**
 * @file hydrator.js
 * @description
 *  The Sefirah of Binah - The Great Scribe.
 *  Translates raw physical blocks into the living language of JS.
 */

const constants = require('../../constants.js');
const { readPointer48 } = require('../binaryHelpers.js');
const keyEncoding = require('../keyEncoding.js');
const bigIntUtils = require('../bigIntUtils.js');
const floatHandler = require('../floatHandler.js');
const serializer = require('../serializer.js');
const codec = require('./codec.js');
const registry = require('./registry.js');
const parser = require('../../deserialize/parser.js');

module.exports = {
    /**
     * @description The Great Resurrection. Resolves a pointer into a hydrated JS value.
     */
    async resolve(ptrBuf, allocator, context = new Map(), SmartPointer) {
        const ptr = codec.decode(ptrBuf);
        if (!ptr) return undefined;

        if (ptr.mode === constants.MODE_INLINE) {
            return await this.decodeInline(ptr.type, ptr.payload, allocator, context, SmartPointer);
        }

        const blockId = readPointer48(ptr.payload, 0);
        const length = (ptr.mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(6) : ptr.payload.readUInt32BE(10);
        const offset = (ptr.mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(10) : ptr.payload.readUInt32BE(6);
        const isChain = (ptr.mode === constants.MODE_BLOCK) && ptr.payload.readUInt8(14) === 1;

        const ctxKey = `${ptr.mode === constants.MODE_HEAP ? 'h' : 'b'}:${blockId}:${offset}`;
        if (context.has(ctxKey)) return context.get(ctxKey);

        // Structural optimization: descriptors for the reader
        if (ptr.mode === constants.MODE_BLOCK && (
            ptr.type === constants.TYPE_SEQUENCE || 
            ptr.type === constants.TYPE_MAP || 
            ptr.type === constants.TYPE_DICTIONARY ||
            ptr.type === constants.TYPE_SET
        )) {
            return { isStructure: true, type: ptr.type, blockId, length, offset, isChain };
        }

        let raw;
        if (ptr.mode === constants.MODE_HEAP) {
             const block = await allocator.readBlock(blockId, false); 
             if (!block) return undefined;
             
             if (offset + length > block.length) {
                 raw = await allocator.v1.db._readChainSafe({ blockId, offset, length, isChain: false });
             } else {
                 raw = block.subarray(offset, offset + length);
             }
        } else {
             raw = await allocator.v1.db._readChainSafe({ blockId, length, isChain, offset });
        }

        if (!raw) return undefined;
        return await this.decodeValue(ptr.type, raw, allocator, context, ctxKey, SmartPointer);
    },

    /**
     * @description Decodes values embedded in the pointer's physical body.
     */
    async decodeInline(type, payload, allocator, context, SmartPointer) {
        const T = constants.VAL_TYPE;
        
        // --- Variable Length Types (Prefixed with Length Byte) ---
        const variableLengthTypes = [
            T.STRING, T.BUFFER, T.TYPED_ARRAY, T.SYMBOL, 
            T.BIGINT_POS, T.BIGINT_NEG
        ];

        let data = payload;
        if (variableLengthTypes.includes(type)) {
            const len = payload[0];
            data = payload.subarray(1, 1 + len);
        }

        if (type === T.SYMBOL) return Symbol.for(data.toString('utf8'));
        if (type === T.BIGINT_POS) return bigIntUtils.fromBuffer(data, false);
        if (type === T.BIGINT_NEG) return bigIntUtils.fromBuffer(data, true);
        if (type === T.BUFFER) return data;
        if (type === T.STRING) return data.toString('utf8');

        // Typed Array Inline
        if (type === T.TYPED_ARRAY) {
             if (data.length < 1) return new Uint8Array(0);
             const viewType = data[0];
             const rawContent = data.subarray(1);
             // Create copy to ensure alignment and detachment from pointer buffer
             const ab = rawContent.buffer.slice(rawContent.byteOffset, rawContent.byteOffset + rawContent.byteLength);
             
             switch(viewType) {
                case 1: return new Int8Array(ab); case 2: return new Uint8Array(ab); case 4: return new Int16Array(ab);
                case 5: return new Uint16Array(ab); case 6: return new Int32Array(ab); case 7: return new Uint32Array(ab);
                case 8: return new Float32Array(ab); case 9: return new Float64Array(ab); case 10: return new BigInt64Array(ab);
                case 11: return new BigUint64Array(ab); default: return new Uint8Array(ab);
             }
        }
        
        // --- Fixed Length & Self-Describing Types ---
        if (type === T.NULL) return null;
        if (type === T.UNDEFINED) return undefined;
        if (type === T.BOOLEAN_TRUE || type === T.BOOLEAN) return payload[0] === 1;
        if (type === T.NAN) return NaN;
        if (type === T.INFINITY) return Infinity;
        if (type === T.NEG_INFINITY) return -Infinity;
        if (type === T.NUMBER) return payload.readDoubleBE(0);
        if (type === T.DATE) return new Date(payload.readDoubleBE(0));
        
        // Numerics
        if (type === T.UINT8) return payload.readUInt8(0);
        if (type === T.UINT16) return payload.readUInt16BE(0);
        if (type === T.UINT32) return payload.readUInt32BE(0);
        if (type === T.UINT64) return Number(payload.readBigUInt64BE(0));
        if (type === T.INT8_NEG) return -1 * payload.readUInt8(0);
        if (type === T.INT16_NEG) return -1 * payload.readUInt16BE(0);
        if (type === T.INT32_NEG) return -1 * payload.readUInt32BE(0);
        if (type === T.INT64_NEG) return -1 * Number(payload.readBigUInt64BE(0));
        
        if (type === T.FLOAT_1) return floatHandler.decodeEncodedFloat(payload.readUInt8(0), 1);
        if (type === T.FLOAT_2) return floatHandler.decodeEncodedFloat(payload.readUInt16BE(0), 2);
        if (type === T.FLOAT_4) return floatHandler.decodeEncodedFloat(payload.readUInt32BE(0), 4);
        if (type === T.FLOAT_NEG_1) return -1 * floatHandler.decodeEncodedFloat(payload.readUInt8(0), 1);
        if (type === T.FLOAT_NEG_2) return -1 * floatHandler.decodeEncodedFloat(payload.readUInt16BE(0), 2);
        if (type === T.FLOAT_NEG_4) return -1 * floatHandler.decodeEncodedFloat(payload.readUInt32BE(0), 4);

        // Inline Structures (Smart Binary) - These handle their own length internally
        if (type === constants.TYPE_SMART_OBJECT || type === constants.TYPE_SMART_ARRAY) {
             const SmartBinary = require('../smartBinary.js');
             if (type === constants.TYPE_SMART_OBJECT) {
                const keys = SmartBinary.getObjectKeys(payload);
                const obj = {};
                for(const k of keys) {
                    const valBuf = SmartBinary.getObjectProperty(payload, k);
                    obj[k] = await SmartPointer.resolve(valBuf, allocator, context);
                }
                return obj;
             } else {
                const count = payload.readUInt32BE(4);
                const arr = [];
                for(let i=0; i<count; i++) {
                    const valBuf = SmartBinary.getArrayIndex(payload, i);
                    arr.push(await SmartPointer.resolve(valBuf, allocator, context));
                }
                return arr;
             }
        }

        return null;
    },

    /**
     * @description Translates raw block data into the light of JS objects.
     */
    async decodeValue(type, buffer, allocator, context, ctxKey, SmartPointer) {
        if (!buffer) return undefined;
        const T = constants.VAL_TYPE;
        
        // Container Rehydration from Heap/Blobs
        if (type === T.MAP) {
            const parsed = parser.parse(buffer);
            // B"H: Convert Buffer keys to Strings if parsed returns array of [key, val]
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
        if (type === T.SET) {
            const parsed = parser.parse(buffer);
            return Array.isArray(parsed) ? new Set(parsed) : new Set();
        }
        if (type === T.ARRAY) return parser.parse(buffer);
        if (type === T.OBJECT) return parser.parse(buffer);
        
        // Core Scalars
        if (type === T.STRING) return buffer.toString('utf8');
        if (type === T.BUFFER) return buffer;
        if (type === T.BIGINT_POS) return bigIntUtils.fromBuffer(buffer, false);
        if (type === T.BIGINT_NEG) return bigIntUtils.fromBuffer(buffer, true);
        if (type === T.SYMBOL) return Symbol.for(buffer.toString('utf8'));
        if (type === T.FUNCTION) return buffer.toString('utf8');
        if (type === T.DATE) return new Date(buffer.readDoubleBE(0));
        
        // RegExp
        if (type === T.REGEXP) {
            try {
                const sRes = serializer.readVarInt(buffer, 0);
                const source = buffer.toString('utf8', sRes.bytesRead, sRes.bytesRead + sRes.value);
                const flags = buffer.toString('utf8', sRes.bytesRead + sRes.value);
                return new RegExp(source, flags);
            } catch(e) { return /ErrorDecodingRegExp/; }
        }

        // Errors (Binary rehydration)
        if (type === T.ERROR) {
            try {
                const rawObj = JSON.parse(buffer.toString('utf8'));
                let e;
                if (rawObj.isAggregate) {
                    const subErrors = (rawObj.errors || []).map(x => Object.assign(new Error(x.message), { name: x.name }));
                    e = new AggregateError(subErrors, rawObj.message);
                } else e = new Error(rawObj.message);
                Object.assign(e, { name: rawObj.name, stack: rawObj.stack, cause: rawObj.cause });
                return e;
            } catch(err) { return new Error("B\"H: Error decoding failed"); }
        }

        // Custom Classes (Techiyas HaMeisim)
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
            
            // Populate properties recursively
            const Reader = require('../../api/liveHandle/reader.js');
            const Navigator = require('../../api/liveHandle/navigator.js');
            
            // B"H: Fortified Mock Handle for recursive property restoration
            const mockHandle = {
                db: allocator.v1.db,
                ensureResolved: async () => {},
                getPath: () => 'resurrection_vessel',
                isLiveHandle: true
            };
            mockHandle.nav = new Navigator(mockHandle);
            const reader = new Reader(mockHandle);
            
            // B"H: Use entries() to get both key and value sparks simultaneously
            // Passing context is critical for ensuring cycle detection
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

        // Typed Arrays
        if (type === T.TYPED_ARRAY) {
            const viewType = buffer[0]; const raw = buffer.subarray(1);
            // B"H: Fix - Ensure we copy the underlying buffer if it's from a shared pool to be safe
            // .slice on ArrayBuffer creates a copy.
            const ab = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
            switch(viewType) {
                case 1: return new Int8Array(ab); case 2: return new Uint8Array(ab); case 4: return new Int16Array(ab);
                case 5: return new Uint16Array(ab); case 6: return new Int32Array(ab); case 7: return new Uint32Array(ab);
                case 8: return new Float32Array(ab); case 9: return new Float64Array(ab); case 10: return new BigInt64Array(ab);
                case 11: return new BigUint64Array(ab); default: return new Uint8Array(ab);
            }
        }
        
        return buffer;
    }
};