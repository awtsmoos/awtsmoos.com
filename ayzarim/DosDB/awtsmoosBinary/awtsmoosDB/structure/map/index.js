// B"H
/**
 * @file index.js
 * @description
 *  The Sefirah of Hod - The B-Tree Engine.
 *  Uses delayed requires for SmartPointer to destroy circular dependency loops.
 */

const constants = require('../../constants.js');
const MapNode = require('./node.js');
const MapOps = require('./ops.js');

class MapEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.ptr = ptr || null;
        this.cache = new Map();
        this.nodeIO = new MapNode(allocator, this); 
        this.ops = new MapOps(this);
        this.MAX_DEPTH = 100;
    }

    async create() {
        const SmartPointer = require('../../utils/smartPointer.js');
        const node = { isLeaf: true, keys: [], values: [], children: [], next: 0, totalCount: 0, totalBytes: 0 };
        const ptr = await this.nodeIO.save(node);
        this.ptr = ptr;
        return SmartPointer.block(constants.TYPE_MAP, this.ptr.blockId, this.ptr.length, this.ptr.isChain, this.ptr.offset);
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
            for(const valPtr of node.values) await this.allocator.free(valPtr);
        } else {
            for(const childPtrBuf of node.children) {
                const childPtr = {
                    blockId: SmartPointer.getBlockId(childPtrBuf),
                    length: SmartPointer.getLength(childPtrBuf),
                    offset: SmartPointer.getOffset(childPtrBuf),
                    isChain: SmartPointer.isChain(childPtrBuf)
                };
                await this._destroyNode(childPtr, depth + 1);
            }
        }
        await this.allocator.v1.free(ptr);
    }

    async stats() {
        if (!this.ptr) return { count: 0, size: 0 };
        const root = await this.nodeIO.load(this.ptr);
        return { count: root.totalCount, size: root.totalBytes };
    }

    async set(key, value, options = {}) {
        const SmartPointer = require('../../utils/smartPointer.js');
        const valPtr = (options.isPtr) ? value : await this.allocator.save(value);
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');

        let root = await this.nodeIO.load(this.ptr);
        const res = await this.ops.insert(root, keyBuf, valPtr, options);
        
        if (res && res.split) {
            const split = res.split;
            const newRoot = {
                isLeaf: false, keys: [split.key], 
                children: [
                    SmartPointer.block(constants.TYPE_MAP, (split.nodePtr || this.ptr).blockId, (split.nodePtr || this.ptr).length, (split.nodePtr || this.ptr).isChain, (split.nodePtr || this.ptr).offset),
                    split.ptr
                ],
                values: [], next: 0
            };
            const leftNode = await this.nodeIO.load(split.nodePtr || this.ptr);
            const rightNode = await this.nodeIO.load(this._decodePtrBuf(split.ptr));
            newRoot.totalCount = leftNode.totalCount + rightNode.totalCount;
            newRoot.totalBytes = leftNode.totalBytes + rightNode.totalBytes;
            this.ptr = await this.nodeIO.save(newRoot);
        } else if (res && res.newPtr) {
            this.ptr = res.newPtr;
        }
    }

    async get(key, context) {
        const SmartPointer = require('../../utils/smartPointer.js');
        const ptr = await this.getPtr(key);
        if (!ptr) return undefined;
        return SmartPointer.resolve(ptr, this.allocator, context);
    }

    async getPtr(key) {
        let currPtr = this.ptr;
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');
        for (let d = 0; d < this.MAX_DEPTH; d++) {
            if (!currPtr || currPtr.blockId === 0) return undefined;
            const node = await this.nodeIO.load(currPtr);
            let low = 0, high = node.keys.length - 1, idx = node.keys.length;
            while (low <= high) {
                const mid = (low + high) >>> 1;
                const cmp = keyBuf.compare(node.keys[mid]);
                if (cmp === 0) { idx = mid + 1; break; }
                if (cmp < 0) { idx = mid; high = mid - 1; } else low = mid + 1;
            }
            if (node.isLeaf) return (idx > 0 && node.keys[idx - 1].compare(keyBuf) === 0) ? node.values[idx - 1] : undefined;
            currPtr = this._decodePtrBuf(node.children[idx]);
        }
        throw new Error("B\"H: Map Max Depth Exceeded");
    }

    async delete(key) {
        let root = await this.nodeIO.load(this.ptr);
        const res = await this.ops.delete(root, Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8'));
        if (res.success && res.newPtr) this.ptr = res.newPtr;
        return res;
    }

    async* range(start, end) {
        const startBuf = start ? Buffer.from(String(start)) : null;
        const endBuf = end ? Buffer.from(String(end)) : null;
        yield* this._iterateNode(this.ptr, startBuf, endBuf, 0);
    }
    
    // B"H: Alias for Indexer
    async* iterateRaw() {
        yield* this.range(null, null);
    }
    
    async* _iterateNode(ptr, start, end, depth) {
        const SmartPointer = require('../../utils/smartPointer.js');
        const node = await this.nodeIO.load(ptr);
        if (node.isLeaf) {
            for(let i=0; i<node.keys.length; i++) {
                const k = node.keys[i];
                if ((!start || k.compare(start) >= 0) && (!end || k.compare(end) <= 0)) {
                    yield { key: k, value: await SmartPointer.resolve(node.values[i], this.allocator), ptr: node.values[i] };
                }
            }
        } else {
            for(let i=0; i<node.children.length; i++) {
                if (end && i > 0 && node.keys[i-1].compare(end) > 0) return;
                yield* this._iterateNode(this._decodePtrBuf(node.children[i]), start, end, depth + 1);
            }
        }
    }
    
    _decodePtrBuf(buf) {
        const SmartPointer = require('../../utils/smartPointer.js');
        return {
            blockId: SmartPointer.getBlockId(buf),
            length: SmartPointer.getLength(buf),
            offset: SmartPointer.getOffset(buf),
            isChain: SmartPointer.isChain(buf)
        };
    }
}
module.exports = MapEngine;