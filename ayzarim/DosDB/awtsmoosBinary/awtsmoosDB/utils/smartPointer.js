
// B"H
const constants = require('../constants.js');
const { writePointer48, readPointer48 } = require('./binaryHelpers.js');
const serializer = require('./serializer.js');
const keyEncoding = require('./keyEncoding.js');
const bigIntUtils = require('./bigIntUtils.js');
const floatHandler = require('./floatHandler.js');

const AwtsmoosClassRegistry = new Map();

class SmartPointer {
    static encode(type, mode, payloadBuffer) {
        // B"H: Optimization - allocUnsafe
        const buf = Buffer.allocUnsafe(constants.POINTER_SIZE);
        const header = (mode << 6) | (type & 0x3F);
        buf.writeUInt8(header, 0);
        
        // Zero out payload area if unused, or copy payload
        if (payloadBuffer) {
            if (payloadBuffer.length > 15) throw new Error("B\"H: Pointer Payload exceeds 15 bytes");
            payloadBuffer.copy(buf, 1);
            // Zero fill remaining bytes if any? 
            if(payloadBuffer.length < 15) {
                buf.fill(0, 1 + payloadBuffer.length);
            }
        } else {
            buf.fill(0, 1);
        }
        return buf;
    }

    static decode(buf) {
        if (!buf || buf.length !== constants.POINTER_SIZE) return null;
        const header = buf.readUInt8(0);
        return {
            mode: (header >> 6) & 0x03,
            type: header & 0x3F,
            payload: buf.subarray(1)
        };
    }

    // B"H: Fast Accessors (Zero Allocation)
    static getMode(buf) { return (buf[0] >> 6) & 0x03; }
    static getType(buf) { return buf[0] & 0x3F; }
    
    static getBlockId(buf) {
        // Payload starts at 1. BlockID is first 6 bytes of payload (indices 1..6)
        return readPointer48(buf, 1);
    }
    
    static getLength(buf) {
        // Payload start at 1. Length is at offset 6 in payload (index 7 in buf)
        return buf.readUInt32BE(7);
    }
    
    static getOffset(buf) {
        // Payload start at 1. Offset is at offset 10 in payload (index 11 in buf)
        return buf.readUInt32BE(11);
    }
    
    static isChain(buf) {
        // Payload start at 1. Chain flag is at offset 14 in payload (index 15 in buf)
        return buf[15] === 1;
    }

    static inline(type, dataBuffer) {
        return SmartPointer.encode(type, constants.MODE_INLINE, dataBuffer);
    }

    static heap(type, blockId, offset, length) {
        const payload = Buffer.allocUnsafe(14); 
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(offset, 6);
        payload.writeUInt32BE(length, 10);
        return SmartPointer.encode(type, constants.MODE_HEAP, payload);
    }

    static block(type, blockId, length = 0, isChain = false, offset = 0) {
        const payload = Buffer.allocUnsafe(15);
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(length, 6);
        payload.writeUInt32BE(offset, 10);
        payload.writeUInt8(isChain ? 1 : 0, 14);
        return SmartPointer.encode(type, constants.MODE_BLOCK, payload);
    }

    static async resolve(ptrBuf, allocator, context = new Map()) {
        const ptr = SmartPointer.decode(ptrBuf);
        if (!ptr) return undefined;

        if (ptr.mode === constants.MODE_INLINE) return SmartPointer.decodeInline(ptr.type, ptr.payload);

        if (ptr.mode === constants.MODE_HEAP) {
            const blockId = readPointer48(ptr.payload, 0);
            const offset = ptr.payload.readUInt32BE(6);
            const length = ptr.payload.readUInt32BE(10);
            
            if (length === 0) return SmartPointer.decodeValue(ptr.type, Buffer.alloc(0), allocator, context, blockId);

            const firstBlockCap = constants.BLOCK_SIZE - offset;
            let raw;
            if (length > firstBlockCap) {
                raw = await allocator.v1.db._readChainSafe({ blockId, offset, length, isChain: true });
            } else {
                // B"H: Use no-copy read since we slice immediately or use subarray
                const block = await allocator.readBlock(blockId, true); 
                if (!block) return null;
                if (offset + length > block.length) {
                     raw = await allocator.v1.db._readChainSafe({ blockId, offset, length, isChain: false });
                } else {
                     raw = block.subarray(offset, offset + length);
                }
            }
            if (!raw) return undefined;
            return SmartPointer.decodeValue(ptr.type, raw, allocator, context);
        }

        if (ptr.mode === constants.MODE_BLOCK) {
            const blockId = readPointer48(ptr.payload, 0);
            const length = ptr.payload.readUInt32BE(6);
            const offset = ptr.payload.readUInt32BE(10);
            const isChain = ptr.payload.readUInt8(14) === 1;
            
            if (context.has(blockId)) {
                return context.get(blockId);
            }
            
            // Allow all types to flow to decodeValue if they are not strictly structure types
            // This includes BigInts, Floats, Strings, Buffers etc.
            if (ptr.type !== constants.TYPE_SEQUENCE && 
                ptr.type !== constants.TYPE_MAP && 
                ptr.type !== constants.TYPE_DICTIONARY &&
                ptr.type !== constants.TYPE_SET) {
                
                const raw = await allocator.v1.db._readChainSafe({ blockId, length, isChain, offset });
                if (!raw) return undefined;
                return SmartPointer.decodeValue(ptr.type, raw, allocator, context, blockId);
            }
            return { isStructure: true, type: ptr.type, blockId, length, offset, isChain };
        }
    }

    static decodeInline(type, payload) {
        if (type === constants.TYPE_NULL) return null;
        if (type === constants.TYPE_UNDEFINED) return undefined;
        if (type === constants.TYPE_BOOLEAN) return payload[0] === 1;
        if (type === constants.TYPE_NUMBER) return payload.readDoubleBE(0);
        if (type === constants.TYPE_STRING) {
            const len = payload[0];
            return payload.toString('utf8', 1, 1 + len);
        }
        return null;
    }

    static async decodeValue(type, buffer, allocator, context, blockId) {
        if (!buffer) return undefined;
        
        // --- Core Primitives ---
        if (type === constants.TYPE_STRING) return buffer.toString('utf8');
        if (type === constants.TYPE_BUFFER) return buffer;
        if (type === constants.TYPE_NUMBER) return parseFloat(buffer.toString());
        if (type === constants.TYPE_JSON) return JSON.parse(buffer.toString('utf8'));
        
        // --- BigInt ---
        if (type === constants.TYPE_BIGINT) return BigInt(buffer.toString('utf8')); // Legacy
        if (type === constants.TYPE_BIGINT_POS) return bigIntUtils.fromBuffer(buffer, false);
        if (type === constants.TYPE_BIGINT_NEG) return bigIntUtils.fromBuffer(buffer, true);
        
        // --- Symbols & Functions ---
        if (type === constants.TYPE_SYMBOL) return Symbol.for(buffer.toString('utf8'));
        if (type === constants.TYPE_FUNCTION) return buffer.toString('utf8');
        
        // --- Special Values ---
        if (type === constants.TYPE_NAN) return NaN;
        if (type === constants.TYPE_INFINITY) return Infinity;
        if (type === constants.TYPE_NEG_INFINITY) return -Infinity;
        if (type === constants.TYPE_BOOLEAN) return buffer[0] === 1;
        if (type === constants.TYPE_NULL) return null;
        if (type === constants.TYPE_UNDEFINED) return undefined;

        // --- Numeric Optimizations ---
        if (type === constants.TYPE_UINT8) return buffer.readUInt8(0);
        if (type === constants.TYPE_UINT16) return buffer.readUInt16BE(0);
        if (type === constants.TYPE_UINT32) return buffer.readUInt32BE(0);
        if (type === constants.TYPE_UINT64) return Number(buffer.readBigUInt64BE(0));
        
        if (type === constants.TYPE_INT8_NEG) return -1 * buffer.readUInt8(0);
        if (type === constants.TYPE_INT16_NEG) return -1 * buffer.readUInt16BE(0);
        if (type === constants.TYPE_INT32_NEG) return -1 * buffer.readUInt32BE(0);
        if (type === constants.TYPE_INT64_NEG) return -1 * Number(buffer.readBigUInt64BE(0));
        
        if (type === constants.TYPE_DOUBLE_POS) return buffer.readDoubleBE(0);
        if (type === constants.TYPE_DOUBLE_NEG) return -1 * buffer.readDoubleBE(0);
        
        if (type === constants.TYPE_FLOAT_1) return floatHandler.decodeEncodedFloat(buffer.readUInt8(0), 1);
        if (type === constants.TYPE_FLOAT_2) return floatHandler.decodeEncodedFloat(buffer.readUInt16BE(0), 2);
        if (type === constants.TYPE_FLOAT_4) return floatHandler.decodeEncodedFloat(buffer.readUInt32BE(0), 4);
        
        if (type === constants.TYPE_FLOAT_NEG_1) return -1 * floatHandler.decodeEncodedFloat(buffer.readUInt8(0), 1);
        if (type === constants.TYPE_FLOAT_NEG_2) return -1 * floatHandler.decodeEncodedFloat(buffer.readUInt16BE(0), 2);
        if (type === constants.TYPE_FLOAT_NEG_4) return -1 * floatHandler.decodeEncodedFloat(buffer.readUInt32BE(0), 4);
        
        // --- Complex Objects ---
        if (type === constants.TYPE_CUSTOM_INSTANCE) {
            let offset = 0;
            const nameInfo = serializer.readString(buffer, offset);
            const className = nameInfo.value;
            offset += nameInfo.bytesRead;
            
            const sourceInfo = serializer.readString(buffer, offset);
            const source = sourceInfo.value;
            offset += sourceInfo.bytesRead;
            
            const dictPtr = buffer.subarray(offset, offset + 16);
            
            let Cls = AwtsmoosClassRegistry.get(className);
            if (!Cls || Cls.toString().replace(/\s/g,'') !== source.replace(/\s/g,'')) {
                try {
                    const registryKeys = Array.from(AwtsmoosClassRegistry.keys());
                    const registryValues = Array.from(AwtsmoosClassRegistry.values());
                    const evalFn = new Function(...registryKeys, `
                        try { return (${source}); } catch(e) { return eval(\`(${source})\`); }
                    `);
                    Cls = evalFn(...registryValues);
                    if (Cls) AwtsmoosClassRegistry.set(className, Cls);
                } catch (e) {}
            }

            const Dictionary = require('../structure/dictionary/index.js');
            const dictBlockId = SmartPointer.getBlockId(dictPtr);
            const dictLength = SmartPointer.getLength(dictPtr);
            const dictOffset = SmartPointer.getOffset(dictPtr);
            const dictIsChain = SmartPointer.isChain(dictPtr);
            
            const dict = new Dictionary(allocator, { blockId: dictBlockId, offset: dictOffset, length: dictLength, isChain: dictIsChain });
            
            let instance;
            if (Cls) {
                try {
                    instance = Object.create(Cls.prototype);
                } catch(e) { instance = {}; }
            } else {
                instance = { __className__: className, __source__: source };
            }

            if (blockId) context.set(blockId, instance);
            
            for await (const key of dict.keys()) {
                const val = await dict.get(key, context);
                const realKey = keyEncoding.decode(key);
                instance[realKey] = val;
            }
            return instance;
        }

        if (type === constants.TYPE_TYPED_ARRAY) {
            if (buffer.length < 1) return new Uint8Array(0);
            const viewType = buffer[0];
            const raw = buffer.subarray(1);
            const buf = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
            
            switch(viewType) {
                case 1: return new Int8Array(buf);
                case 2: return new Uint8Array(buf);
                case 3: return new Uint8ClampedArray(buf);
                case 4: return new Int16Array(buf);
                case 5: return new Uint16Array(buf);
                case 6: return new Int32Array(buf);
                case 7: return new Uint32Array(buf);
                case 8: return new Float32Array(buf);
                case 9: return new Float64Array(buf);
                case 10: return new BigInt64Array(buf);
                case 11: return new BigUint64Array(buf);
                case 12: return (typeof Float16Array !== 'undefined') ? new Float16Array(buf) : new DataView(buf);
                default: return new DataView(buf);
            }
        }

        if (type === constants.TYPE_DATE) return new Date(buffer.readDoubleBE(0));
        if (type === constants.TYPE_REGEXP) {
            const obj = JSON.parse(buffer.toString('utf8'));
            return new RegExp(obj.$regex, obj.$flags);
        }
        if (type === constants.TYPE_ERROR) {
            try {
                const obj = JSON.parse(buffer.toString('utf8'));
                let e;
                if (obj.isAggregate) {
                    const subErrors = (obj.errors || []).map(x => {
                        const sub = new Error(x.message);
                        sub.name = x.name;
                        return sub;
                    });
                    e = new AggregateError(subErrors, obj.message);
                } else {
                    e = new Error(obj.message);
                }
                e.name = obj.name; 
                if(obj.stack) e.stack = obj.stack; 
                if(obj.cause) e.cause = obj.cause;
                return e;
            } catch(err) { return new Error("Failed to deserialize Error"); }
        }
        return buffer;
    }
}
module.exports = SmartPointer;
