// B"H
/**
 * @file structure/map/ops/deletion.js
 * @description
 * Deletes one key, re-saves every node on the path, and reports the seals
 * those nodes retired so the caller can free them at write time (§8.1).
 * A child that empties out is spliced from its parent; the fresh empty
 * node just saved for it is retired as well, since nothing links it.
 */

const Search = require('./search.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');

class MapDeletion {
    constructor(nodeIO) { this.nodeIO = nodeIO; }

    perform(node, keyBuf, currentSeal) {
        const s = Search.findKey(node, keyBuf);
        const idx = s.index;

        if (node.isLeaf) {
            if (s.found) {
                node.keys.splice(idx, 1);
                node.values.splice(idx, 1);
                return {
                    success: true,
                    newSeal: this.nodeIO.save(node),
                    retiredSeals: currentSeal ? [Buffer.from(currentSeal)] : []
                };
            }
            return { success: false, retiredSeals: [] };
        } else {
            let childIdx = s.found ? idx + 1 : idx;
            if (childIdx >= node.children.length) childIdx = node.children.length - 1;

            const childPtr = SmartPointer.decode(node.children[childIdx]);
            const child = this.nodeIO.load(childPtr);
            const res = this.perform(child, keyBuf, node.children[childIdx]);

            if (res.success) {
                node.children[childIdx] = res.newSeal;
                let retired = res.retiredSeals || [];
                // Check for empty branch
                if (child.keys.length === 0 && node.children.length > 1) {
                     node.children.splice(childIdx, 1);
                     if (childIdx < node.keys.length) node.keys.splice(childIdx, 1);
                     else node.keys.splice(childIdx - 1, 1);
                     // The empty child node was just saved and is now
                     // unlinked: retire its fresh seal too.
                     retired = [...retired, res.newSeal];
                }
                const newSeal = this.nodeIO.save(node);
                if (currentSeal) retired = [Buffer.from(currentSeal), ...retired];
                return { success: true, newSeal, retiredSeals: retired };
            }
            return { success: false, retiredSeals: [] };
        }
    }
}

module.exports = MapDeletion;
