// B"H
const SmartPointer = require('../../utils/smartPointer.js');
const constants = require('../../constants.js');
const utils = require('./ops_utils.js');

/**
 * @class AppendOps
 * @description
 *  The Sefirah of Chesed - The Outpouring of Manifestation.
 */
class AppendOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
        this.db = sequence.db;
    }

    append(itemPtr) {
        const root = this.nodeIO.load(this.seq.ptr);
        const res = this._appendRecursive(root, itemPtr);
        
        if (res.splitNode) {
            utils.handleRootSplit(this.nodeIO, this.seq, root, [res.splitNode]);
            return { newPtr: this.seq.ptr };
        }
        return { newPtr: res.newPtr || this.seq.ptr };
    }

    _appendRecursive(node, itemPtr) {
        const itemSize = utils.getPtrSize(itemPtr);
        
        if (node.isLeaf) {
            if (node.itemCount < 200) {
                itemPtr.copy(node.buffer, 23 + (node.itemCount * 16));
                node.itemCount++;
                node.totalCount = node.itemCount;
                node.totalBytes = (node.totalBytes || 0) + itemSize;
                const newPtr = this.nodeIO.save(node);
                return { deltaCount: 1, deltaBytes: itemSize, splitNode: null, newPtr };
            } else {
                const newNode = this.nodeIO.create(true, node.isWeak);
                itemPtr.copy(newNode.buffer, 23);
                newNode.itemCount = 1; newNode.totalCount = 1; newNode.totalBytes = itemSize;
                this.nodeIO.save(newNode);
                return { deltaCount: 1, deltaBytes: itemSize, splitNode: newNode };
            }
        } else {
            const lastIdx = node.itemCount - 1;
            const entryOff = 23 + (lastIdx * 20);
            const childPtr = utils.decodePtr(node.buffer.subarray(entryOff, entryOff + 16));
            const childNode = this.nodeIO.load(childPtr);
            const res = this._appendRecursive(childNode, itemPtr);
            
            if (res.newPtr) {
                const enc = utils.encodePtr(res.newPtr);
                enc.copy(node.buffer, entryOff);
            }
            node.buffer.writeUInt32BE(childNode.totalCount, entryOff + 16);
            
            if (res.splitNode) {
                if (node.itemCount < 200) {
                    const newOff = 23 + (node.itemCount * 20);
                    utils.encodePtr(res.splitNode.ptr).copy(node.buffer, newOff);
                    node.buffer.writeUInt32BE(res.splitNode.totalCount, newOff + 16);
                    node.itemCount++;
                }
            }
            
            node.totalCount += 1;
            node.totalBytes = (node.totalBytes || 0) + itemSize;
            const myNewPtr = this.nodeIO.save(node);
            return { deltaCount: 1, deltaBytes: itemSize, splitNode: res.splitNode, newPtr: myNewPtr };
        }
    }
}
module.exports = AppendOps;