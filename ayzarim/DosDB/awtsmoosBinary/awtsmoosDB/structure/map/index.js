// B"H
/**
 * @file index.js
 * @description
 *  The Sefirah of Hod - The B-Tree Engine.
 *  Uses strictly synchronous I/O for instant sorted data retrieval.
 */

const constants = require('../../constants.js');
const MapNode = require('./node.js');
const MapOps = require('./ops.js');
const SmartPointer = require('../../utils/smartPointer.js');

class MapEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.ptr = ptr || null;
        this.nodeIO = new MapNode(allocator, this); 
        this.ops = new MapOps(this);
        this.db = allocator.v1.db;
    }

    create() {
        const node = { isLeaf: true, keys: [], values: [], children: [], next: 0, totalCount: 0, totalBytes: 0 };
        const ptr = this.nodeIO.save(node);
        this.ptr = ptr;
        return SmartPointer.block(constants.VAL_TYPE.MAP, this.ptr.blockId, this.ptr.length, this.ptr.isChain, this.ptr.offset);
    }

    set(key, value, options = {}) {
        const valPtr = (options.isPtr) ? value : this.allocator.save(value);
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');

        let root = this.nodeIO.load(this.ptr);
        const res = this.ops.insert(root, keyBuf, valPtr, options);
        
        if (res && res.split) {
            const split = res.split;
            const newRoot = {
                isLeaf: false, keys: [split.key], 
                children: [
                    SmartPointer.block(constants.VAL_TYPE.MAP, (split.nodePtr || this.ptr).blockId, (split.nodePtr || this.ptr).length, (split.nodePtr || this.ptr).isChain, (split.nodePtr || this.ptr).offset),
                    split.ptr
                ],
                values: [], next: 0
            };
            const leftNode = this.nodeIO.load(split.nodePtr || this.ptr);
            const rightNode = this.nodeIO.load(this._decodePtrBuf(split.ptr));
            newRoot.totalCount = leftNode.totalCount + rightNode.totalCount;
            newRoot.totalBytes = leftNode.totalBytes + rightNode.totalBytes;
            this.ptr = this.nodeIO.save(newRoot);
        } else if (res && res.newPtr) {
            this.ptr = res.newPtr;
        }
    }

    get(key) {
        const ptr = this.getPtr(key);
        if (!ptr) return undefined;
        return SmartPointer.resolve(ptr, this.allocator);
    }

    getPtr(key) {
        let currPtr = this.ptr;
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');
        while (currPtr && currPtr.blockId !== 0) {
            const node = this.nodeIO.load(currPtr);
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
        return undefined;
    }

    delete(key) {
        let root = this.nodeIO.load(this.ptr);
        const res = this.ops.delete(root, Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8'));
        if (res.success && res.newPtr) this.ptr = res.newPtr;
        return res;
    }

    *range(start, end) {
        const startBuf = start ? Buffer.from(String(start)) : null;
        const endBuf = end ? Buffer.from(String(end)) : null;
        yield* this._iterateNode(this.ptr, startBuf, endBuf);
    }
    
    *_iterateNode(ptr, start, end) {
        const node = this.nodeIO.load(ptr);
        if (node.isLeaf) {
            for(let i=0; i<node.keys.length; i++) {
                const k = node.keys[i];
                if ((!start || k.compare(start) >= 0) && (!end || k.compare(end) <= 0)) {
                    yield { key: k, value: SmartPointer.resolve(node.values[i], this.allocator), ptr: node.values[i] };
                }
            }
        } else {
            for(let i=0; i<node.children.length; i++) {
                if (end && i > 0 && node.keys[i-1].compare(end) > 0) return;
                yield* this._iterateNode(this._decodePtrBuf(node.children[i]), start, end);
            }
        }
    }
    
    _decodePtrBuf(buf) {
        return {
            blockId: SmartPointer.getBlockId(buf),
            length: SmartPointer.getLength(buf),
            offset: SmartPointer.getOffset(buf),
            isChain: SmartPointer.isChain(buf)
        };
    }
}
module.exports = MapEngine;
