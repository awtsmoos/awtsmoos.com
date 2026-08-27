
// B"H
const SmartPointer = require('../../../utils/smartPointer.js');
const utils = require('./utils.js');

class AppendOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
        this.db = sequence.db;
    }

    append(itemPtr) {
        let root = this.nodeIO.load(this.seq.ptr);
        if (!root) {
            root = this.nodeIO.create(true);
            this.seq.ptr = this.nodeIO.save(root);
        }
        
        const res = this._appendRecursive(root, itemPtr);
        
        if (res.splitNode) {
            utils.handleRootSplit(this.nodeIO, this.seq, root, [res.splitNode]);
            return { newPtr: this.seq.ptr };
        }
        return { newPtr: res.newPtr || this.seq.ptr };
    }

    _appendRecursive(node, itemPtr) {
        const itemSize = utils.getPtrSize(itemPtr);
        const MAX_ITEMS = 200;
        
        if (node.isLeaf) {
            if (node.items.length < MAX_ITEMS) {
                node.items.push({ ptr: itemPtr, count: 1 });
                node.totalCount++;
                node.totalBytes = (node.totalBytes || 0) + itemSize;
                const newPtr = this.nodeIO.save(node);
                return { deltaCount: 1, deltaBytes: itemSize, splitNode: null, newPtr };
            } else {
                const newNode = this.nodeIO.create(true, node.isWeak);
                newNode.items.push({ ptr: itemPtr, count: 1 });
                newNode.totalCount = 1; 
                newNode.totalBytes = itemSize;
                this.nodeIO.save(newNode);
                return { deltaCount: 1, deltaBytes: itemSize, splitNode: newNode };
            }
        } else {
            const lastIdx = node.items.length - 1;
            const childRef = node.items[lastIdx];
            
            const childPtr = utils.decodePtr(childRef.ptr);
            const childNode = this.nodeIO.load(childPtr);
            const res = this._appendRecursive(childNode, itemPtr);
            
            if (res.newPtr) {
                childRef.ptr = utils.encodePtr(res.newPtr);
            }
            childRef.count = childNode.totalCount;
            
            if (res.splitNode) {
                if (node.items.length < MAX_ITEMS) {
                    node.items.push({ ptr: utils.encodePtr(res.splitNode.ptr), count: res.splitNode.totalCount });
                }
            }
            
            node.totalCount += 1;
            node.totalBytes = (node.totalBytes || 0) + itemSize;
            const myNewPtr = this.nodeIO.save(node);
            
            return { deltaCount: 1, deltaBytes: itemSize, splitNode: (node.items.length > MAX_ITEMS ? res.splitNode : null), newPtr: myNewPtr };
        }
    }
}

module.exports = AppendOps;
