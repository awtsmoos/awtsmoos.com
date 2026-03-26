
// B"H
/**
 * @file structure/map/ops/split.js
 * @description
 *  The Dividing Light. Manages the expansion of the B-Tree vessels.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const { readPointer48 } = require('../../../utils/binaryHelpers.js');

const MAX_KEYS = 200; 

class MapSplitOps {
    constructor(mapOps) {
        this.mapOps = mapOps;
        this.nodeIO = mapOps.nodeIO;
    }

    checkSplit(node) {
        if (node.keys.length <= MAX_KEYS) {
            return null;
        }
        
        const mid = Math.floor(node.keys.length / 2);
        const rightKeys = node.keys.splice(mid);
        let splitKey;
        const sibling = { isLeaf: node.isLeaf, keys: [], values: [], children: [], next: 0, totalCount: 0, totalBytes: 0 };

        if (node.isLeaf) {
            splitKey = rightKeys[0];
            sibling.keys = rightKeys; 
            sibling.values = node.values.splice(mid);
            sibling.next = node.next;
            this.recalcStats(node); 
            this.recalcStats(sibling);
        } else {
            splitKey = rightKeys.shift();
            sibling.keys = rightKeys; 
            sibling.children = node.children.splice(mid + 1);
            this.sumChildrenStats(node); 
            this.sumChildrenStats(sibling);
        }
        
        const sibPtr = this.nodeIO.save(sibling);
        if (node.isLeaf) node.next = sibPtr.blockId; 
        
        const newSelfPtr = this.nodeIO.save(node, node.selfPtr);
        
        return { 
            key: splitKey, 
            ptr: SmartPointer.block(constants.TYPE_MAP, sibPtr.blockId, sibPtr.length, sibPtr.isChain, sibPtr.offset),
            nodePtr: newSelfPtr
        };
    }

    recalcStats(leaf) {
        leaf.totalCount = leaf.keys.length; leaf.totalBytes = 0;
        for(let i=0; i<leaf.keys.length; i++) {
            leaf.totalBytes += leaf.keys[i].length; 
            leaf.totalBytes += this.mapOps._getPtrSize(leaf.values[i]);
        }
    }

    sumChildrenStats(internal) {
        internal.totalCount = 0; internal.totalBytes = 0;
        for(const childPtrBuf of internal.children) {
            const decoded = SmartPointer.decode(childPtrBuf);
            const childPtr = {
                blockId: readPointer48(decoded.payload, 0),
                length: decoded.payload.readUInt32BE(6),
                offset: decoded.payload.readUInt32BE(10),
                isChain: decoded.payload.readUInt8(14) === 1
            };
            
            const child = this.nodeIO.load(childPtr);
            internal.totalCount += (child.totalCount || 0); 
            internal.totalBytes += (child.totalBytes || 0);
        }
    }

    handleSplit(node, idx, split) {
        node.keys.splice(idx, 0, split.key);
        node.children.splice(idx + 1, 0, split.ptr);
        
        if (split.nodePtr) {
            node.children[idx] = SmartPointer.block(
                constants.TYPE_MAP,
                split.nodePtr.blockId,
                split.nodePtr.length,
                split.nodePtr.isChain,
                split.nodePtr.offset
            );
        }

        const res = this.checkSplit(node);
        
        if (res) {
             return { split: res, deltaCount: 0, newPtr: null };
        } else {
             const newPtr = this.nodeIO.save(node, node.selfPtr);
             return { split: null, deltaCount: 0, newPtr };
        }
    }
}

module.exports = MapSplitOps;
