
// B"H
/**
 * @file delete.js
 * @description Map Deletion Logic separated for modularity.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Search = require('./search.js');

class MapDeleteOps {
    constructor(mapOps) {
        this.mapOps = mapOps;
        this.nodeIO = mapOps.nodeIO;
    }

    perform(node, keyBuf) {
        const search = Search.findKey(node, keyBuf);
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
            let childIdx = search.found ? idx + 1 : idx;
            if (childIdx >= node.children.length) childIdx = node.children.length - 1;

            const childPtr = this.mapOps._decodePtrBuf(node.children[childIdx]);
            const child = this.nodeIO.load(childPtr);
            const res = this.perform(child, keyBuf);
            
            if (res.success) {
                if (res.newPtr) {
                    // B"H: Forging the true seal using Exact-Byte Encoding
                    node.children[childIdx] = SmartPointer.encode(
                        constants.VAL_TYPE.MAP,
                        res.newPtr.offset,
                        res.newPtr.length
                    );
                }
                node.totalCount -= 1;
                const newPtr = this.nodeIO.save(node);
                return { success: true, deltaCount: -1, newPtr };
            }
            return res;
        }
    }
}
module.exports = MapDeleteOps;
