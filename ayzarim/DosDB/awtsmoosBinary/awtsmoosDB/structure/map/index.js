
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const MapNode = require('./node.js');
const MapOps = require('./ops.js');
const keyEncoding = require('../../utils/keyEncoding.js');

class MapEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        if (ptr && typeof ptr === 'object') {
            this.ptr = ptr;
        } else if (typeof ptr === 'number') {
            this.ptr = { blockId: ptr, offset: 0, length: constants.BLOCK_SIZE, isChain: false };
        } else {
            this.ptr = null;
        }
        
        // B"H: CACHE REMOVED per instruction. 
        // We rely on Raw Buffer Speed and OS Page Cache.
        
        this.nodeIO = new MapNode(allocator, this); 
        this.ops = new MapOps(this);
        this.MAX_DEPTH = 100;
    }

    log(msg) {
        // console.log(`[TRACE MapEngine] ${msg}`);
    }

    async create() {
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
        if (node.isLeaf) {
            for(const valPtr of node.values) {
                try { await this.allocator.free(valPtr); } catch(e) {}
            }
        } else {
            for(const childPtrBuf of node.children) {
                const decoded = SmartPointer.decode(childPtrBuf);
                if (decoded && decoded.mode === constants.MODE_BLOCK) {
                    const childPtr = this._decodePtr(decoded.payload);
                    await this._destroyNode(childPtr, depth + 1);
                }
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
        const isPtr = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;

        const valPtr = isPtr ? value : ((Buffer.isBuffer(value) && value.length === 16) ? value : await this.allocator.save(value));
        
        // B"H: Convert key to Buffer ONCE here
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');

        let root = await this.nodeIO.load(this.ptr);
        const res = await this.ops.insert(root, keyBuf, valPtr, { skipFree });
        
        if (res && res.split) {
            const split = res.split;
            const leftChildPtr = split.nodePtr || this.ptr;
            
            const newRoot = {
                isLeaf: false, keys: [split.key], 
                children: [
                    SmartPointer.block(constants.TYPE_MAP, leftChildPtr.blockId, leftChildPtr.length, leftChildPtr.isChain, leftChildPtr.offset),
                    split.ptr
                ],
                values: [], next: 0, totalCount: root.totalCount + res.split.totalCount, totalBytes: root.totalBytes + res.split.totalBytes 
            };
            
            const leftNode = await this.nodeIO.load(leftChildPtr);
            const rightNodePtr = this._decodePtr(SmartPointer.decode(split.ptr).payload);
            const rightNode = await this.nodeIO.load(rightNodePtr);
            
            newRoot.totalCount = leftNode.totalCount + rightNode.totalCount;
            newRoot.totalBytes = leftNode.totalBytes + rightNode.totalBytes;

            const newPtr = await this.nodeIO.save(newRoot);
            this.ptr = newPtr;
        } else if (res && res.newPtr) {
            this.ptr = res.newPtr;
        }
    }

    async get(key, context) {
        const ptr = await this.getPtr(key);
        if (!ptr) return undefined;
        return SmartPointer.resolve(ptr, this.allocator, context);
    }

    async getPtr(key) {
        let currPtr = this.ptr;
        let depth = 0;
        
        // B"H: Use Buffer for comparison
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');
        
        while (true) {
            if (depth++ > this.MAX_DEPTH) throw new Error("B\"H: Map Max Depth Exceeded");
            if (!currPtr || currPtr.blockId === 0) return undefined;
            
            const node = await this.nodeIO.load(currPtr);
            
            // Binary Search
            let low = 0, high = node.keys.length - 1, idx = node.keys.length;
            
            while (low <= high) {
                const mid = (low + high) >>> 1;
                const cmp = keyBuf.compare(node.keys[mid]);
                if (cmp === 0) { idx = mid + 1; break; } // Exact match (for leaf check)
                if (cmp < 0) { idx = mid; high = mid - 1; }
                else { low = mid + 1; }
            }
            // idx is now the insertion point (first key > searchKey)
            
            if (node.isLeaf) {
                // Check if the previous key matches (since idx points to first > key)
                // Wait, logic:
                // Keys: [10, 20, 30]
                // Search 20: cmp=0, idx=2.
                // keys[2-1] = 20. Match.
                // Search 15: cmp<0 at 20. idx=1. keys[0]=10. No match.
                
                // If binary search found exact match logic:
                if (idx > 0 && node.keys[idx - 1].compare(keyBuf) === 0) {
                    return node.values[idx - 1];
                }
                return undefined;
            } else {
                if (idx >= node.children.length) return undefined;
                const childPtrBuf = node.children[idx];
                const decoded = SmartPointer.decode(childPtrBuf);
                currPtr = this._decodePtr(decoded.payload);
            }
        }
    }

    async delete(key) {
        let currPtr = this.ptr;
        const stack = [];
        let depth = 0;
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');

        while (true) {
            if (depth++ > this.MAX_DEPTH) throw new Error("B\"H: Map Max Depth Exceeded");
            const node = await this.nodeIO.load(currPtr);
            stack.push(node);
            
            // Binary Search
            let low = 0, high = node.keys.length - 1, idx = node.keys.length;
            while (low <= high) {
                const mid = (low + high) >>> 1;
                const cmp = keyBuf.compare(node.keys[mid]);
                if (cmp === 0) { idx = mid + 1; break; }
                if (cmp < 0) { idx = mid; high = mid - 1; }
                else { low = mid + 1; }
            }

            if (node.isLeaf) {
                if (idx > 0 && node.keys[idx - 1].compare(keyBuf) === 0) {
                    const keySize = node.keys[idx-1].length;
                    const valSize = this.ops._getPtrSize(node.values[idx-1]);
                    const deltaBytes = -(keySize + valSize);
                    
                    node.keys.splice(idx - 1, 1);
                    const removedVals = node.values.splice(idx - 1, 1);
                    if (removedVals.length > 0) this.allocator.free(removedVals[0]).catch(e => {});
                    
                    node.totalCount -= 1; node.totalBytes += deltaBytes;
                    await this.nodeIO.save(node, node.selfPtr);
                    stack.pop();
                    
                    while(stack.length > 0) {
                        const parent = stack.pop(); parent.totalCount -= 1; parent.totalBytes += deltaBytes;
                        await this.nodeIO.save(parent, parent.selfPtr);
                    }
                    return true;
                }
                return false;
            } else {
                const childPtrBuf = node.children[idx];
                currPtr = this._decodePtr(SmartPointer.decode(childPtrBuf).payload);
            }
        }
    }

    async* range(start, end) {
        for await (const item of this.iterateRaw(start, end)) {
            const val = await SmartPointer.resolve(item.ptr, this.allocator);
            const keyStr = item.key.toString('utf8');
            yield { key: keyStr, value: val };
        }
    }

    async* iterateRaw(start, end) {
        let currPtr = this.ptr;
        const startBuf = start ? (Buffer.isBuffer(start) ? start : Buffer.from(start)) : null;
        const endBuf = end ? (Buffer.isBuffer(end) ? end : Buffer.from(end)) : null;
        yield* this._iterateNode(currPtr, startBuf, endBuf, 0);
    }
    
    async* _iterateNode(ptr, start, end, depth) {
        if (depth > this.MAX_DEPTH) throw new Error("B\"H: Map Max Depth Exceeded");
        const node = await this.nodeIO.load(ptr);
        
        if (node.isLeaf) {
            for(let i=0; i<node.keys.length; i++) {
                const k = node.keys[i];
                if (!start || k.compare(start) >= 0) {
                    if (end && k.compare(end) > 0) return;
                    yield { key: k, ptr: node.values[i] };
                }
            }
        } else {
            let idx = 0;
            if (start) {
                // Binary Search for start index
                let low = 0, high = node.keys.length - 1;
                idx = node.keys.length; // Default to last child
                while (low <= high) {
                    const mid = (low + high) >>> 1;
                    if (node.keys[mid].compare(start) >= 0) {
                        idx = mid; high = mid - 1;
                    } else {
                        low = mid + 1;
                    }
                }
            }
            
            for(let i=idx; i<node.children.length; i++) {
                if (end && i > 0 && i <= node.keys.length && node.keys[i-1].compare(end) > 0) return;

                const childPtrBuf = node.children[i];
                const decoded = SmartPointer.decode(childPtrBuf);
                const childPtr = this._decodePtr(decoded.payload);
                
                yield* this._iterateNode(childPtr, start, end, depth + 1);
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
module.exports = MapEngine;
