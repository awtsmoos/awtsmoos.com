
// B"H
const AllocatorV1 = require('./allocator/index.js');
const HeapManager = require('./heap.js');
const constants = require('../constants.js');
const SmartPointer = require('../utils/smartPointer.js');
const { readPointer48 } = require('../utils/binaryHelpers.js');
const serializer = require('../utils/serializer.js');

class AllocatorV2 {
    constructor(pager, db) {
        this.v1 = new AllocatorV1(pager, db);
        this.heap = new HeapManager(this.v1);
    }

    async init() { await this.v1.init(); }
    async readBlock(blockId) { return this.v1.readBlockLocked(blockId); }

    // B"H: New Method to flush heap
    async flushHeap() {
        if (this.heap) await this.heap.flush();
    }

    async save(val) {
        let type, data;
        if (val === null) return SmartPointer.inline(constants.TYPE_NULL, Buffer.alloc(0));
        if (val === undefined) return SmartPointer.inline(constants.TYPE_UNDEFINED, Buffer.alloc(0));
        
        if (typeof val === 'boolean') return SmartPointer.inline(constants.TYPE_BOOLEAN, Buffer.from([val ? 1 : 0]));
        
        if (typeof val === 'number') {
            const buf = Buffer.alloc(8); buf.writeDoubleBE(val, 0);
            return SmartPointer.inline(constants.TYPE_NUMBER, buf);
        }
        
        if (typeof val === 'bigint') {
            type = constants.TYPE_BIGINT;
            data = Buffer.from(val.toString());
        }
        else if (typeof val === 'symbol') {
            type = constants.TYPE_SYMBOL;
            const key = Symbol.keyFor(val) || val.description || "Symbol";
            data = Buffer.from(key, 'utf8');
        }
        else if (typeof val === 'function') {
            type = constants.TYPE_FUNCTION;
            data = Buffer.from(val.toString(), 'utf8');
        }
        else if (typeof val === 'string') {
            const buf = Buffer.from(val, 'utf8');
            if (buf.length < 12) {
                const p = Buffer.alloc(15); p[0] = buf.length; buf.copy(p, 1);
                return SmartPointer.inline(constants.TYPE_STRING, p);
            }
            type = constants.TYPE_STRING; data = buf;
        } 
        else if (Buffer.isBuffer(val)) { type = constants.TYPE_BUFFER; data = val; }
        else if (val instanceof ArrayBuffer) { type = constants.TYPE_BUFFER; data = Buffer.from(val); }
        else if (ArrayBuffer.isView(val)) {
            type = constants.TYPE_TYPED_ARRAY;
            const viewType = this._getTypedArrayType(val);
            const raw = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
            data = Buffer.concat([Buffer.from([viewType]), raw]);
        }
        else if (val instanceof Date) {
            type = constants.TYPE_DATE;
            data = Buffer.alloc(8);
            data.writeDoubleBE(val.getTime(), 0);
        }
        else if (val instanceof RegExp) {
            type = constants.TYPE_REGEXP;
            data = Buffer.from(JSON.stringify({ $regex: val.source, $flags: val.flags }));
        }
        else if (val instanceof Error) {
            type = constants.TYPE_ERROR;
            const errObj = { 
                name: val.name, 
                message: val.message, 
                stack: val.stack,
                cause: val.cause 
            };
            if (val instanceof AggregateError) {
                errObj.isAggregate = true;
                errObj.errors = Array.from(val.errors).map(e => ({
                    name: e.name || 'Error',
                    message: e.message || String(e)
                }));
            }
            try {
                data = Buffer.from(JSON.stringify(errObj));
            } catch(e) {
                data = Buffer.from(JSON.stringify({ name: "Error", message: "Failed to serialize error details" }));
            }
        }
        else { 
            type = constants.TYPE_JSON; 
            try {
                // B"H: Manual cyclic protection or special JSON replacer
                const jsonStr = JSON.stringify(val, (k, v) => typeof v === 'bigint' ? v.toString() : v);
                data = Buffer.from(jsonStr || "{}"); 
            } catch (e) {
                data = Buffer.from(JSON.stringify({ $error: "Unserializable Object", message: e.message }));
            }
        }

        if (data.length <= 1024) {
            const loc = await this.heap.allocate(data);
            return SmartPointer.heap(type, loc.blockId, loc.offset, loc.length);
        } else {
            const ptr = await this.v1.allocate(data.length);
            await this.v1.db._writeChainSafe(ptr, data);
            // B"H: Pass offset to block pointer
            return SmartPointer.block(type, ptr.blockId, data.length, ptr.isChain, ptr.offset);
        }
    }

    _getTypedArrayType(view) {
        if (view instanceof Int8Array) return 1;
        if (view instanceof Uint8Array) return 2;
        if (view instanceof Uint8ClampedArray) return 3;
        if (view instanceof Int16Array) return 4;
        if (view instanceof Uint16Array) return 5;
        if (view instanceof Int32Array) return 6;
        if (view instanceof Uint32Array) return 7;
        if (view instanceof Float32Array) return 8;
        if (view instanceof Float64Array) return 9;
        if (view instanceof BigInt64Array) return 10;
        if (view instanceof BigUint64Array) return 11;
        if (typeof Float16Array !== 'undefined' && view instanceof Float16Array) return 12;
        return 0;
    }

    async free(ptrBuf) {
        if (!ptrBuf || ptrBuf.length !== constants.POINTER_SIZE) return;
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return;

        if (decoded.mode === constants.MODE_HEAP) {
            const blockId = readPointer48(decoded.payload, 0);
            const length = decoded.payload.readUInt32BE(10);
            await this.heap.free(blockId, length);
        }
        else if (decoded.mode === constants.MODE_BLOCK) {
             const blockId = readPointer48(decoded.payload, 0);
             const length = decoded.payload.readUInt32BE(6);
             const offset = decoded.payload.readUInt32BE(10);
             const isChain = decoded.payload.readUInt8(14) === 1;
             
             // Construct ptr object
             const ptr = { blockId, length, offset, isChain };

             if (decoded.type === constants.TYPE_SEQUENCE || decoded.type === constants.TYPE_SET) {
                 const Sequence = require('../structure/sequence/index.js');
                 await (new Sequence(this, ptr)).destroy();
             }
             else if (decoded.type === constants.TYPE_MAP) {
                 const MapEngine = require('../structure/map/index.js');
                 await (new MapEngine(this, ptr)).destroy();
             }
             else if (decoded.type === constants.TYPE_DICTIONARY) {
                 const Dictionary = require('../structure/dictionary/index.js');
                 await (new Dictionary(this, ptr)).destroy();
             }
             else {
                 // Raw Block/Chain free
                 await this.v1.free(ptr);
             }
        }
    }
}
module.exports = AllocatorV2;
