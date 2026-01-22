// B"H
/**
 * @file ops.js
 * @description
 *  The Scribe of the B-Tree Transformations. 
 *  Coordinates the shifting of keys and the balance of children during insertions.
 *  Isolation is ensured; every pointer bubble-up is definitive and synchronous.
 *  No 'wait' allowed.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const DeleteOps = require('./ops_delete.js');

class MapOps {
    constructor(engine) {
        this.engine = engine;
        this.nodeIO = engine.nodeIO;
        this.db = engine.db;
        this.splitOps = new (require('./ops_split.js'))(this);
        this.deleteOps = new DeleteOps(this);
    }

    _getPtrSize(ptrBuf) {
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return 0;
        if (decoded.mode === constants.MODE_HEAP) return decoded.payload.readUInt32BE(10);
        if (decoded.mode === constants.MODE_BLOCK) return decoded.payload.readUInt32BE(6);
        return 16;
    }
    
    _search(node, keyBuf) {
        let low = 0;
        let high = node.keys.length - 1;
        while (low <= high) {
            const mid = (low + high) >>> 1;
            const cmp = keyBuf.compare(node.keys[mid]);
            if (cmp === 0) return { index: mid, found: true };
            if (cmp < 0) high = mid - 1;
            else low = mid + 1;
        }
        return { index: low, found: false };
    }

    /**
     * @description Synchronously descends the tree and weaves a new value into its structure.
     */
    insert(node, keyBuf, valPtr, options = {}) {
        const search = this._search(node, keyBuf);
        const idx = search.index;

        if (node.isLeaf) {
            if (search.found) {
                node.values[idx] = valPtr;
                const newPtr = this.nodeIO.save(node);
                return { deltaCount: 0, newPtr };
            }
            node.keys.splice(idx, 0, keyBuf); 
            node.values.splice(idx, 0, valPtr);
            node.totalCount += 1;
            
            const splitRes = this.splitOps.checkSplit(node);
            if (splitRes) return { split: splitRes, deltaCount: 1, newPtr: splitRes.nodePtr };
            
            const newPtr = this.nodeIO.save(node);
            return { deltaCount: 1, newPtr };
        } else {
            const limit = node.children.length - 1;
            const targetChildIdx = idx > limit ? limit : idx;
            
            const childPtrBuf = node.children[targetChildIdx];
            const childAddr = this._decodePtrBuf(childPtrBuf);
            const childNode = this.nodeIO.load(childAddr);
            
            if (!childNode) throw new Error("B\"H Fatal: Child node missing in B-Tree branch.");

            const res = this.insert(childNode, keyBuf, valPtr, options);
            
            // Definitive Bubble-Up update
            if (res.newPtr) {
                node.children[targetChildIdx] = SmartPointer.toBuffer(res.newPtr); 
            }
            
            if (res.split) {
                const bubble = this.splitOps.handleSplit(node, targetChildIdx, res.split);
                return { deltaCount: res.deltaCount, newPtr: bubble.newPtr, split: bubble.split };
            }
            
            node.totalCount += (res.deltaCount || 0);
            const newSelfPtr = this.nodeIO.save(node);
            return { deltaCount: res.deltaCount, newPtr: newSelfPtr };
        }
    }

    delete(node, keyBuf) {
        return this.deleteOps.delete(node, keyBuf);
    }

    _decodePtrBuf(buf) {
        if (!buf) return null;
        if (typeof buf === 'object' && buf.blockId !== undefined) return buf;
        const decoded = SmartPointer.decode(buf);
        if (!decoded) return null;
        if (decoded.mode === constants.MODE_BLOCK) {
            return {
                blockId: readPointer48(decoded.payload, 0),
                length: decoded.payload.readUInt32BE(6),
                offset: decoded.payload.readUInt32BE(10),
                isChain: decoded.payload.readUInt8(14) === 1
            };
        }
        if (decoded.mode === constants.MODE_HEAP) {
            return {
                blockId: readPointer48(decoded.payload, 0),
                offset: decoded.payload.readUInt32BE(6),
                length: decoded.payload.readUInt32BE(10),
                isHeap: true
            };
        }
        return null;
    }
}
module.exports = MapOps;