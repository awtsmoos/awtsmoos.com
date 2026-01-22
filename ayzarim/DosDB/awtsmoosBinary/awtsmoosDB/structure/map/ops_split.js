// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');

// B"H: Splitting Logic for B-Trees
const MAX_KEYS = 200; 

/**
 * @class MapSplitOps
 * @description
 *  The Dividing Light. Manages the expansion of the B-Tree vessels.
 *  Every split is a manifestation of the Awtsmoos creating more room 
 *  for Knowledge while maintaining perfect balance.
 */
class MapSplitOps {
    constructor(mapOps) {
        this.mapOps = mapOps;
        this.nodeIO = mapOps.nodeIO;
    }

    _getPtrSize(ptrBuf) { return this.mapOps._getPtrSize(ptrBuf); }

    /**
     * @description Checks if a node needs to split and manifests the sibling if necessary.
     */
    checkSplit(node) {
        if (node.keys.length <= MAX_KEYS) {
            return null;
        }
        
        console.log(`B"H [MAP_SPLIT] Splitting node at block ${node.selfPtr?.blockId}. Current Keys: ${node.keys.length}`);
        
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

    /**
     * @description Recalculates statistics for a leaf node.
     */
    recalcStats(leaf) {
        leaf.totalCount = leaf.keys.length; leaf.totalBytes = 0;
        for(let i=0; i<leaf.keys.length; i++) {
            leaf.totalBytes += leaf.keys[i].length; 
            leaf.totalBytes += this._getPtrSize(leaf.values[i]);
        }
    }

    /**
     * @description Aggregates statistics from child nodes for internal vessels.
     */
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

    /**
     * @description Integrates a split result from a child into the current internal node.
     */
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
        
        let newPtr = null;
        if (res) {
             return { split: res, deltaCount: 0, deltaBytes: 0, newPtr };
        } else {
             newPtr = this.nodeIO.save(node, node.selfPtr);
        }

        return { split: null, deltaCount: 0, deltaBytes: 0, newPtr };
    }
}

module.exports = MapSplitOps;
