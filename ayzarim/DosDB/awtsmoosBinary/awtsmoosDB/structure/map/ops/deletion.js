
// B"H
/**
 * @file structure/map/ops/deletion.js
 */

const Search = require('./search.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');

class MapDeletion {
    constructor(nodeIO) { this.nodeIO = nodeIO; }

    perform(node, keyBuf) {
        const s = Search.findKey(node, keyBuf);
        const idx = s.index;

        if (node.isLeaf) {
            if (s.found) {
                node.keys.splice(idx, 1);
                node.values.splice(idx, 1);
                return { success: true, newSeal: this.nodeIO.save(node) };
            }
            return { success: false };
        } else {
            let childIdx = s.found ? idx + 1 : idx;
            if (childIdx >= node.children.length) childIdx = node.children.length - 1;
            
            const childPtr = SmartPointer.decode(node.children[childIdx]);
            const child = this.nodeIO.load(childPtr);
            const res = this.perform(child, keyBuf);
            
            if (res.success) {
                node.children[childIdx] = res.newSeal;
                // Check for empty branch
                if (child.keys.length === 0 && node.children.length > 1) {
                     node.children.splice(childIdx, 1);
                     if (childIdx < node.keys.length) node.keys.splice(childIdx, 1);
                     else node.keys.splice(childIdx - 1, 1);
                }
                return { success: true, newSeal: this.nodeIO.save(node) };
            }
            return { success: false };
        }
    }
}

module.exports = MapDeletion;
