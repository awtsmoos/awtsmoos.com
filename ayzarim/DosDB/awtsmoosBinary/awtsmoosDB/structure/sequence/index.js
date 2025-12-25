// B"H
/**
 * @file index.js
 * @description
 *  The Sefirah of Tiferet - The Sequence Engine.
 *  Uses delayed requires to ensure perfect rehydration during resurrection.
 */

const constants = require('../../constants.js');
const SequenceNode = require('./node.js');
const SequenceOps = require('./ops.js');

class SequenceEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.ptr = ptr || null;
        this.nodeIO = new SequenceNode(allocator, this);
        this.ops = new SequenceOps(this);
        this.MAX_DEPTH = 100;
    }

    async create(options = {}) {
        const SmartPointer = require('../../utils/smartPointer.js');
        const root = await this.nodeIO.create(true, options.isWeak);
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
        const node = await this.nodeIO.load(ptr);
        const SmartPointer = require('../../utils/smartPointer.js');
        if (node.isLeaf) {
            if (!node.isWeak) {
                for(let i=0; i<node.itemCount; i++) {
                    const off = 23 + (i * 16);
                    await this.allocator.free(node.buffer.subarray(off, off + 16));
                }
            }
        } else {
             for(let i=0; i<node.itemCount; i++) {
                 const off = 23 + (i * 20);
                 await this._destroyNode(this._decodePtrBuf(node.buffer.subarray(off, off + 16)), depth + 1);
             }
        }
        await this.allocator.v1.free(ptr);
    }

    async length() {
        if (!this.ptr) return 0;
        return (await this.nodeIO.load(this.ptr)).totalCount;
    }

    async push(value) {
        const ptr = (Buffer.isBuffer(value) && value.length === 16) ? value : await this.allocator.save(value);
        await this.ops.append(ptr);
    }

    async splice(start, deleteCount, ...items) {
        const newPtrs = [];
        for(const item of items) newPtrs.push((Buffer.isBuffer(item) && item.length === 16) ? item : await this.allocator.save(item));
        await this.ops.splice(start, deleteCount, newPtrs);
    }

    async get(index, context) {
        const SmartPointer = require('../../utils/smartPointer.js');
        const ptr = await this.getPtr(index);
        return ptr ? SmartPointer.resolve(ptr, this.allocator, context) : undefined;
    }

    async getPtr(index) {
        let currPtr = this.ptr;
        let localIdx = index;
        for (let d = 0; d < this.MAX_DEPTH; d++) {
            if (!currPtr) return undefined;
            const node = await this.nodeIO.load(currPtr);
            if (localIdx >= node.totalCount) return undefined;
            if (node.isLeaf) {
                const ptr = Buffer.allocUnsafe(16);
                node.buffer.copy(ptr, 0, 23 + (localIdx * 16), 39 + (localIdx * 16));
                return ptr;
            }
            let off = 23;
            for(let i=0; i<node.itemCount; i++) {
                const childCount = node.buffer.readUInt32BE(off + 16);
                if (localIdx < childCount) { currPtr = this._decodePtrBuf(node.buffer.subarray(off, off + 16)); break; }
                localIdx -= childCount; off += 20;
            }
        }
        return undefined;
    }

    _decodePtrBuf(buf) {
        const SmartPointer = require('../../utils/smartPointer.js');
        return { blockId: SmartPointer.getBlockId(buf), length: SmartPointer.getLength(buf), offset: SmartPointer.getOffset(buf), isChain: SmartPointer.isChain(buf) };
    }
    
    // B"H: Iterator for Indexing
    async* iterateRaw() {
        yield* this._iterateNodeRaw(this.ptr);
    }

    async* _iterateNodeRaw(ptr) {
        if (!ptr) return;
        const node = await this.nodeIO.load(ptr);
        
        if (node.isLeaf) {
            for(let i=0; i<node.itemCount; i++) {
                const off = 23 + (i * 16);
                const p = Buffer.allocUnsafe(16);
                node.buffer.copy(p, 0, off, off + 16);
                yield { ptr: p };
            }
        } else {
             for(let i=0; i<node.itemCount; i++) {
                 const off = 23 + (i * 20);
                 const childPtrBuf = node.buffer.subarray(off, off+16);
                 const childPtr = this._decodePtrBuf(childPtrBuf);
                 yield* this._iterateNodeRaw(childPtr);
             }
        }
    }
}
module.exports = SequenceEngine;