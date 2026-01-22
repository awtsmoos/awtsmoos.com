// B"H
/**
 * @file ops_delete.js
 * @description Map Deletion Logic separated for modularity.
 */

const SmartPointer = require('../../utils/smartPointer.js');

class MapDeleteOps {
    constructor(mapOps) {
        this.mapOps = mapOps;
        this.nodeIO = mapOps.nodeIO;
    }

    delete(node, keyBuf) {
        const search = this.mapOps._search(node, keyBuf);
        const idx = search.index;

        if (node.isLeaf) {
            if (search.found) {
                node.keys.splice(idx, 1);
                node.values.splice(idx, 1);
                node.totalCount -= 1;
                const newPtr = this.nodeIO.save(node);
                return { success: true, deltaCount: -1, newPtr };
            }
            return { success: false };
        } else {
            let childIdx = idx;
            if (search.found) childIdx = idx + 1;
            if (childIdx >= node.children.length) childIdx = node.children.length - 1;

            const childPtr = this.mapOps._decodePtrBuf(node.children[childIdx]);
            const child = this.nodeIO.load(childPtr);
            const res = this.delete(child, keyBuf);
            
            if (res.success) {
                if (res.newPtr) node.children[childIdx] = SmartPointer.toBuffer(res.newPtr);
                node.totalCount -= 1;
                const newPtr = this.nodeIO.save(node);
                return { success: true, deltaCount: -1, newPtr };
            }
            return res;
        }
    }
}
module.exports = MapDeleteOps;