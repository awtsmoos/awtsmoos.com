
// B"H
/**
 * @file structure/map/ops/index.js
 * @description
 *  The Scribe of the B-Tree Transformations. 
 *  Coordinates the shifting of keys and the balance of children during insertions.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const { readPointer48 } = require('../../../utils/binaryHelpers.js');
const Search = require('./search.js');
const SplitOps = require('./split.js');
const DeleteOps = require('./delete.js');

class MapOps {
    constructor(engine) {
        this.engine = engine;
        this.nodeIO = engine.nodeIO;
        this.db = engine.db;
        this.splitOps = new SplitOps(this);
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
        return Search.findKey(node, keyBuf);
    }

    /**
     * @method insert
     * @description Synchronously descends the tree and weaves a new value into its structure.
     * THE TIKKUN: Correct target child selection and GUARANTEED type sealing for internal pointers.
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
            let targetChildIdx = search.found ? idx + 1 : idx;
            const limit = node.children.length - 1;
            if (targetChildIdx > limit) targetChildIdx = limit;
            
            const childPtrBuf = node.children[targetChildIdx];
            const childAddr = this._decodePtrBuf(childPtrBuf);
            const childNode = this.nodeIO.load(childAddr);
            
            if (!childNode) throw new Error("B\"H Fatal: Child node missing in B-Tree branch.");

            const res = this.insert(childNode, keyBuf, valPtr, options);
            
            if (res.newPtr) {
                // B"H: The Tikkun. We must explicitly forge the seal with the MAP type.
                node.children[targetChildIdx] = SmartPointer.block(
                    constants.VAL_TYPE.MAP,
                    res.newPtr.blockId,
                    res.newPtr.length,
                    !!res.newPtr.isChain,
                    res.newPtr.offset
                );
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
        return this.deleteOps.perform(node, keyBuf);
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
