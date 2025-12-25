// B"H
const AllocatorV1 = require('./allocator/index.js');
const HeapManager = require('./heap.js');
const constants = require('../constants.js');
const SmartPointer = require('../utils/smartPointer.js');
const { readPointer48 } = require('../utils/binaryHelpers.js');
const serializer = require('../utils/serializer.js');
const bigIntUtils = require('../utils/bigIntUtils.js');

class AllocatorV2 {
    constructor(pager, db, options = {}) {
        this.v1 = new AllocatorV1(pager, db, options);
        this.heap = new HeapManager(this.v1);
    }

    async init() { await this.v1.init(); }
    async readBlock(blockId) { return this.v1.readBlockLocked(blockId); }

    async flushHeap() {
        if (this.heap) await this.heap.flush();
    }

    async save(val) {
        const serializeValue = require('./allocator/serialize/serializeValue.js');
        const spark = serializeValue(val, false);
        const type = spark.type;
        const data = spark.data;

        const T = constants.VAL_TYPE;

        // --- GATE 1: INLINE OPTIMIZATION ---
        // Max payload is 15 bytes.
        
        // 1. Variable Length Types: Must use Byte 0 for Length (Max data 14 bytes)
        const variableLengthTypes = [
            T.STRING, T.BUFFER, T.TYPED_ARRAY, T.SYMBOL, 
            T.BIGINT_POS, T.BIGINT_NEG
        ];

        if (variableLengthTypes.includes(type)) {
            if (data.length <= 14) {
                 const payload = Buffer.alloc(15);
                 payload[0] = data.length;
                 data.copy(payload, 1);
                 return SmartPointer.encode(type, constants.MODE_INLINE, payload);
            }
        } 
        // 2. Fixed/Self-Describing Types: Can use full 15 bytes
        else if (data.length <= 15) {
             const inlineable = [
                 T.NULL, T.UNDEFINED, T.BOOLEAN, T.BOOLEAN_TRUE, T.BOOLEAN_FALSE,
                 T.UINT8, T.UINT16, T.UINT32, T.UINT64,
                 T.INT8_NEG, T.INT16_NEG, T.INT32_NEG, T.INT64_NEG,
                 T.FLOAT_1, T.FLOAT_2, T.FLOAT_4,
                 T.FLOAT_NEG_1, T.FLOAT_NEG_2, T.FLOAT_NEG_4,
                 T.DOUBLE_POS, T.DOUBLE_NEG, T.NUMBER, T.NAN, T.INFINITY, T.NEG_INFINITY,
                 T.DATE, 
                 constants.TYPE_SMART_OBJECT, constants.TYPE_SMART_ARRAY
             ];
             
             if (inlineable.includes(type)) {
                  const payload = Buffer.alloc(15);
                  data.copy(payload, 0);
                  return SmartPointer.encode(type, constants.MODE_INLINE, payload);
             }
        }

        // --- GATE 2: HEAP STORAGE ---
        if (data.length <= 1024) {
            const loc = await this.heap.allocate(data);
            return SmartPointer.heap(type, loc.blockId, loc.offset, loc.length);
        } 
        
        // --- GATE 3: BLOCK CHAIN STORAGE ---
        const ptr = await this.v1.allocate(data.length);
        await this.v1.db._writeChainSafe(ptr, data);
        return SmartPointer.block(type, ptr.blockId, data.length, ptr.isChain, ptr.offset);
    }

    async free(ptrBuf) {
        if (!ptrBuf || ptrBuf.length !== constants.POINTER_SIZE) return;
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return;

        if (decoded.mode === constants.MODE_HEAP) {
            const { readPointer48 } = require('../utils/binaryHelpers.js');
            const blockId = readPointer48(decoded.payload, 0);
            const length = decoded.payload.readUInt32BE(10);
            await this.heap.free(blockId, length);
        }
        else if (decoded.mode === constants.MODE_BLOCK) {
             const { readPointer48 } = require('../utils/binaryHelpers.js');
             const blockId = readPointer48(decoded.payload, 0);
             const length = decoded.payload.readUInt32BE(6);
             const offset = decoded.payload.readUInt32BE(10);
             const isChain = decoded.payload.readUInt8(14) === 1;
             const ptr = { blockId, length, offset, isChain };

             const T = constants.VAL_TYPE;
             if (decoded.type === T.ARRAY || decoded.type === T.SET) 
                 await (new (require('../structure/sequence/index.js'))(this, ptr)).destroy();
             else if (decoded.type === T.MAP) 
                 await (new (require('../structure/map/index.js'))(this, ptr)).destroy();
             else if (decoded.type === T.OBJECT) 
                 await (new (require('../structure/dictionary/index.js'))(this, ptr)).destroy();
             else 
                 await this.v1.free(ptr);
        }
    }
}
module.exports = AllocatorV2;