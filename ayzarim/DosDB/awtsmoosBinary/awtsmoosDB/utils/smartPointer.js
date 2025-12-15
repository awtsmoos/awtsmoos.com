
// B"H
const constants = require('../constants.js');
const { writePointer48, readPointer48 } = require('./binaryHelpers.js');
const serializer = require('./serializer.js');
const keyEncoding = require('./keyEncoding.js');

const AwtsmoosClassRegistry = new Map();

class SmartPointer {
    static encode(type, mode, payloadBuffer) {
        const buf = Buffer.alloc(constants.POINTER_SIZE);
        const header = (mode << 6) | (type & 0x3F);
        buf.writeUInt8(header, 0);
        if (payloadBuffer) {
            if (payloadBuffer.length > 15) throw new Error("B\"H: Pointer Payload exceeds 15 bytes");
            payloadBuffer.copy(buf, 1);
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

    static inline(type, dataBuffer) {
        return SmartPointer.encode(type, constants.MODE_INLINE, dataBuffer);
    }

    static heap(type, blockId, offset, length) {
        const payload = Buffer.alloc(14); 
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(offset, 6);
        payload.writeUInt32BE(length, 10);
        return SmartPointer.encode(type, constants.MODE_HEAP, payload);
    }

    static block(type, blockId, length = 0, isChain = false, offset = 0) {
        const payload = Buffer.alloc(15);
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
            const firstBlockCap = constants.BLOCK_SIZE - offset;
            let raw;
            if (length > firstBlockCap) {
                raw = await allocator.v1.db._readChainSafe({ blockId, offset, length, isChain: true });
            } else {
                const block = await allocator.readBlock(blockId);
                if (!block) return null;
                raw = block.subarray(offset, offset + length);
            }
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

            if (ptr.type === constants.TYPE_BUFFER || ptr.type === constants.TYPE_STRING || ptr.type === constants.TYPE_JSON || 
                ptr.type === constants.TYPE_DATE || ptr.type === constants.TYPE_REGEXP || ptr.type === constants.TYPE_ERROR ||
                ptr.type === constants.TYPE_BIGINT || ptr.type === constants.TYPE_SYMBOL || ptr.type === constants.TYPE_TYPED_ARRAY ||
                ptr.type === constants.TYPE_FUNCTION || ptr.type === constants.TYPE_CUSTOM_INSTANCE) {
                
                const raw = await allocator.v1.db._readChainSafe({ blockId, length, isChain, offset });
                return SmartPointer.decodeValue(ptr.type, raw, allocator, context, blockId);
            }
            // B"H: Structure Return - Ensure blockId is valid
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
        if (type === constants.TYPE_STRING) return buffer.toString('utf8');
        if (type === constants.TYPE_BUFFER) return buffer;
        if (type === constants.TYPE_NUMBER) return parseFloat(buffer.toString());
        if (type === constants.TYPE_JSON) return JSON.parse(buffer.toString('utf8'));
        
        if (type === constants.TYPE_BIGINT) return BigInt(buffer.toString('utf8'));
        if (type === constants.TYPE_SYMBOL) return Symbol.for(buffer.toString('utf8'));
        
        if (type === constants.TYPE_FUNCTION) {
            // B"H: Return source string directly. Eval is unsafe and slow.
            // Tests expect string.
            return buffer.toString('utf8');
        }
        
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
                } catch (e) {
                    // console.warn(`[AwtsmoosDB] Warning: Could not recompile ${className}.`);
                }
            }

            const Dictionary = require('../structure/dictionary/index.js');
            const dictRes = SmartPointer.decode(dictPtr);
            const dictBlockId = readPointer48(dictRes.payload, 0);
            const dictOffset = dictRes.payload.readUInt32BE(10);
            const dictLength = dictRes.payload.readUInt32BE(6);
            const dictIsChain = dictRes.payload.readUInt8(14) === 1;
            
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
