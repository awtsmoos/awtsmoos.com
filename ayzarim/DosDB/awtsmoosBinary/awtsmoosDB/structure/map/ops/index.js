
// B"H
/**
 * @file index.js
 * @description
 *  The Scribe of the B-Tree Transformations. 
 *  Coordinates the shifting of keys and the balance of children during insertions.
 *  Purged of the illusory chunking modes. Embraces Exact-Byte VarInt offsets.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
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
        return SmartPointer.readSize(ptrBuf, 0);
    }
    
    _search(node, keyBuf) {
        return Search.findKey(node, keyBuf);
    }

    /**
     * @method insert
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
            let targetChildIdx = search.found ? idx + 1 : idx;
            const limit = node.children.length - 1;
            if (targetChildIdx > limit) targetChildIdx = limit;
            
            const childPtrBuf = node.children[targetChildIdx];
            const childAddr = this._decodePtrBuf(childPtrBuf);
            const childNode = this.nodeIO.load(childAddr);
            
            if (!childNode) throw new Error("B\"H Fatal: Child node missing in B-Tree branch.");

            const res = this.insert(childNode, keyBuf, valPtr, options);
            
            if (res.newPtr) {
                // B"H: We must explicitly forge the seal with the MAP type.
                node.children[targetChildIdx] = SmartPointer.encode(
                    constants.VAL_TYPE.MAP,
                    res.newPtr.offset,
                    res.newPtr.length
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
        if (typeof buf === 'object' && buf.offset !== undefined) return buf;
        return SmartPointer.decode(buf);
    }
}
module.exports = MapOps;
