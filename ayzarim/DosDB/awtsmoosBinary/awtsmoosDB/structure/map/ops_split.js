
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');

// B"H: Splitting Logic for B-Trees
const MAX_KEYS = 200; 

class MapSplitOps {
    constructor(mapOps) {
        this.mapOps = mapOps;
        this.nodeIO = mapOps.nodeIO;
    }

    _getPtrSize(ptrBuf) { return this.mapOps._getPtrSize(ptrBuf); }

    async checkSplit(node) {
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
            await this.recalcStats(node); await this.recalcStats(sibling);
        } else {
            splitKey = rightKeys.shift();
            sibling.keys = rightKeys; 
            sibling.children = node.children.splice(mid + 1);
            await this.sumChildrenStats(node); await this.sumChildrenStats(sibling);
        }
        
        const sibPtr = await this.nodeIO.save(sibling);
        
        if (node.isLeaf) node.next = sibPtr.blockId; 
        
        const newSelfPtr = await this.nodeIO.save(node, node.selfPtr);
        
        return { 
            key: splitKey, 
            ptr: SmartPointer.block(constants.TYPE_MAP, sibPtr.blockId, sibPtr.length, sibPtr.isChain, sibPtr.offset),
            nodePtr: newSelfPtr
        };
    }

    async recalcStats(leaf) {
        leaf.totalCount = leaf.keys.length; leaf.totalBytes = 0;
        for(let i=0; i<leaf.keys.length; i++) {
            leaf.totalBytes += leaf.keys[i].length; // key is Buffer
            leaf.totalBytes += this._getPtrSize(leaf.values[i]);
        }
    }

    async sumChildrenStats(internal) {
        internal.totalCount = 0; internal.totalBytes = 0;
        for(const childPtrBuf of internal.children) {
            const decoded = SmartPointer.decode(childPtrBuf);
            const childPtr = {
                blockId: readPointer48(decoded.payload, 0),
                length: decoded.payload.readUInt32BE(6),
                offset: decoded.payload.readUInt32BE(10),
                isChain: decoded.payload.readUInt8(14) === 1
            };
            
            const child = await this.nodeIO.load(childPtr);
            internal.totalCount += child.totalCount; internal.totalBytes += child.totalBytes;
        }
    }

    async handleSplit(node, idx, split) {
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

        const res = await this.checkSplit(node);
        
        let newPtr = null;
        if (res) {
             return { split: res, deltaCount: 0, deltaBytes: 0, newPtr };
        } else {
             newPtr = await this.nodeIO.save(node, node.selfPtr);
        }

        return { split: null, deltaCount: 0, deltaBytes: 0, newPtr };
    }
}

module.exports = MapSplitOps;
