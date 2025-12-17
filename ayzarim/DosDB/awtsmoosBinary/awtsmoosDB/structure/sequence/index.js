
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const SequenceNode = require('./node.js');
const SequenceOps = require('./ops.js');
const DATA_OFFSET = 23; 

class SequenceEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        if (ptr && typeof ptr === 'object') {
            this.ptr = ptr;
        } else if (typeof ptr === 'number') {
            this.ptr = { blockId: ptr, offset: 0, length: constants.BLOCK_SIZE, isChain: false };
        } else {
            this.ptr = null;
        }
        
        // Node Cache
        this.cache = new Map();
        this.CACHE_LIMIT = 200;

        this.nodeIO = new SequenceNode(allocator, this);
        this.ops = new SequenceOps(this);
        this.MAX_DEPTH = 100;
    }

    async create(options = {}) {
        const isWeak = options.isWeak || false;
        const root = await this.nodeIO.create(true, isWeak);
        this.ptr = root.ptr;
        await this.nodeIO.save(root);
        return SmartPointer.block(constants.TYPE_SEQUENCE, this.ptr.blockId, this.ptr.length, this.ptr.isChain, this.ptr.offset);
    }

    async destroy() {
        if (!this.ptr) return;
        await this._destroyNode(this.ptr, 0);
    }

    async _destroyNode(ptr, depth) {
        if (depth > this.MAX_DEPTH) return;
        if (this.cache.has(ptr.blockId)) this.cache.delete(ptr.blockId);

        const node = await this.nodeIO.load(ptr);
        
        if (node.isLeaf) {
            // B"H: CRITICAL FIX - Only free items if the sequence is NOT weak (owns items)
            if (!node.isWeak) {
                for(let i=0; i<node.itemCount; i++) {
                    const ptrOffset = DATA_OFFSET + (i * 16);
                    const ptrBuf = node.buffer.subarray(ptrOffset, ptrOffset+16);
                    try { await this.allocator.free(ptrBuf); } catch(e) {}
                }
            }
        } else {
             for(let i=0; i<node.itemCount; i++) {
                 const ptrOffset = DATA_OFFSET + (i * 20);
                 const ptrBuf = node.buffer.subarray(ptrOffset, ptrOffset+16);
                 const decoded = SmartPointer.decode(ptrBuf);
                 if (decoded && decoded.mode === constants.MODE_BLOCK) {
                     const childPtr = this._decodePtr(decoded.payload);
                     await this._destroyNode(childPtr, depth + 1);
                 }
             }
        }
        await this.allocator.v1.free(ptr);
    }

    async length() {
        if (!this.ptr) return 0;
        const root = await this.nodeIO.load(this.ptr);
        return root.totalCount;
    }
    
    async byteSize() {
        if (!this.ptr) return 0;
        const root = await this.nodeIO.load(this.ptr);
        return root.totalBytes;
    }

    async stats() {
        if (!this.ptr) return { count: 0, size: 0, capacity: 0, fragmentation: 0 };
        const root = await this.nodeIO.load(this.ptr);
        const frag = root.totalCapacity > 0 ? (1 - (root.totalBytes / root.totalCapacity)) : 0;
        return { count: root.totalCount, size: root.totalBytes, capacity: root.totalCapacity, fragmentation: frag };
    }

    async push(value) {
        let ptr;
        if (Buffer.isBuffer(value) && value.length === 16) ptr = value;
        else ptr = await this.allocator.save(value);
        
        await this.ops.append(ptr);
    }

    async splice(start, deleteCount, ...items) {
        const newPtrs = [];
        for(const item of items) {
            if (Buffer.isBuffer(item) && item.length === 16) newPtrs.push(item);
            else newPtrs.push(await this.allocator.save(item));
        }
        await this.ops.splice(start, deleteCount, newPtrs);
    }

    async set(index, value, options = {}) {
        let ptr;
        if (Buffer.isBuffer(value) && value.length === 16) ptr = value;
        else ptr = await this.allocator.save(value);
        
        // B"H: Use replace
        await this.ops.replace(index, ptr, options);
    }

    async get(index, context) {
        const ptr = await this.getPtr(index);
        if (!ptr) return undefined;
        return SmartPointer.resolve(ptr, this.allocator, context);
    }

    async getPtr(index) {
        let currPtr = this.ptr;
        let localIndex = index;
        let depth = 0;

        while(true) {
            if (depth++ > this.MAX_DEPTH) throw new Error("B\"H: Sequence Max Depth Exceeded");
            
            const node = await this.nodeIO.load(currPtr);
            if (localIndex >= node.totalCount) {
                return undefined;
            }

            if (node.isLeaf) {
                const offset = DATA_OFFSET + (localIndex * 16);
                // B"H: FIX - Correctly copy buffer. Use alloc to be safe.
                const ptr = Buffer.alloc(16);
                node.buffer.copy(ptr, 0, offset, offset + 16);
                return ptr;
            } else {
                let offset = DATA_OFFSET;
                let foundChild = false;
                for(let i=0; i<node.itemCount; i++) {
                    const childCount = node.buffer.readUInt32BE(offset + 16);
                    if (localIndex < childCount) {
                        const childPtrBuf = node.buffer.subarray(offset, offset + 16);
                        currPtr = this._decodePtr(SmartPointer.decode(childPtrBuf).payload);
                        foundChild = true;
                        break; 
                    }
                    localIndex -= childCount;
                    offset += 20;
                }
                if (!foundChild) {
                    if(this.allocator.v1.db.debug) console.error(`B"H Seq.getPtr: Failed to find child for index ${index}. Node Dump:`, node);
                    return undefined;
                }
            }
        }
    }

    async slice(start, end) {
        const len = await this.length();
        if (end === undefined) end = len;
        if (start < 0) start = Math.max(0, len + start);
        if (end < 0) end = Math.max(0, len + end);
        if (start > len) start = len;
        if (end > len) end = len;
        if (start > end) start = end;

        const res = [];
        for(let i=start; i<end; i++) res.push(await this.get(i));
        return res;
    }

    async compact() {
        const len = await this.length();
        const newSeq = new SequenceEngine(this.allocator);
        await newSeq.create();
        for(let i=0; i<len; i++) {
            const val = await this.get(i);
            if (val && val.isStructure) await newSeq.push(SmartPointer.block(val.type, val.blockId, val.length, val.isChain, val.offset));
            else await newSeq.push(val);
        }
        this.ptr = newSeq.ptr;
    }

    async concat(otherSeq) {
        if (!otherSeq || !otherSeq.ptr) return;
        const myRoot = await this.nodeIO.load(this.ptr);
        const otherRoot = await this.nodeIO.load(otherSeq.ptr);
        
        // B"H: New root inherits weakness from primary (left)
        const newRoot = await this.nodeIO.create(false, myRoot.isWeak);
        
        const leftPtr = SmartPointer.block(constants.TYPE_SEQUENCE, this.ptr.blockId, this.ptr.length, this.ptr.isChain, this.ptr.offset);
        const rightPtr = SmartPointer.block(constants.TYPE_SEQUENCE, otherSeq.ptr.blockId, otherSeq.ptr.length, otherSeq.ptr.isChain, otherSeq.ptr.offset);
        const leftData = Buffer.alloc(20); leftPtr.copy(leftData, 0); leftData.writeUInt32BE(myRoot.totalCount, 16);
        const rightData = Buffer.alloc(20); rightPtr.copy(rightData, 0); rightData.writeUInt32BE(otherRoot.totalCount, 16);
        newRoot.buffer.set(leftData, DATA_OFFSET); newRoot.buffer.set(rightData, DATA_OFFSET + 20);
        newRoot.itemCount = 2;
        newRoot.totalCount = myRoot.totalCount + otherRoot.totalCount;
        newRoot.totalBytes = myRoot.totalBytes + otherRoot.totalBytes;
        await this.nodeIO.save(newRoot);
        this.ptr = newRoot.ptr;
    }

    async* iterateRaw() {
        yield* this._iterateNodeRaw(this.ptr);
    }

    async* _iterateNodeRaw(ptr) {
        const node = await this.nodeIO.load(ptr);
        if (node.isLeaf) {
            for(let i=0; i<node.itemCount; i++) {
                const offset = DATA_OFFSET + (i * 16);
                const valPtr = node.buffer.subarray(offset, offset + 16);
                const val = await SmartPointer.resolve(valPtr, this.allocator);
                yield { ptr: valPtr, value: val };
            }
        } else {
            for(let i=0; i<node.itemCount; i++) {
                const offset = DATA_OFFSET + (i * 20);
                const childPtrBuf = node.buffer.subarray(offset, offset + 16);
                const childPtr = this._decodePtr(SmartPointer.decode(childPtrBuf).payload);
                yield* this._iterateNodeRaw(childPtr);
            }
        }
    }

    _decodePtr(payload) {
        return {
            blockId: readPointer48(payload, 0),
            length: payload.readUInt32BE(6),
            offset: payload.readUInt32BE(10),
            isChain: payload.readUInt8(14) === 1
        };
    }
}
module.exports = SequenceEngine;