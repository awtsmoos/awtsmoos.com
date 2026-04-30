
// B"H
/**
 * @file structure/map/ops/insertion.js
 * @description
 * Chapter 52: The Inscription of Keys.
 * Gevurah (Severity) establishes boundaries. Insertion carves names 
 * into those boundaries. This module descends the tree, balancing and 
 * splitting as it goes.
 */

const Search = require('./search.js');
const SplitOps = require('./split.js');
const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');

class MapInsertion {
    constructor(nodeIO) {
        this.nodeIO = nodeIO;
        this.splitLogic = new SplitOps(nodeIO);
    }

    /**
     * @method perform
     * @description Recursively descends and inserts.
     */
    perform(node, keyBuf, valPtr) {
        const s = Search.findKey(node, keyBuf);
        const idx = s.index;

        if (node.isLeaf) {
            if (s.found) {
                node.values[idx] = valPtr;
            } else {
                node.keys.splice(idx, 0, keyBuf);
                node.values.splice(idx, 0, valPtr);
            }
            
            const split = this.splitLogic.check(node);
            return split ? { split, newSeal: split.nodeSeal } : { newSeal: this.nodeIO.save(node) };
        } else {
            // Internal Node descent
            let childIdx = s.found ? idx + 1 : idx;
            if (childIdx >= node.children.length) childIdx = node.children.length - 1;
            
            const childPtr = SmartPointer.decode(node.children[childIdx]);
            const childNode = this.nodeIO.load(childPtr);
            const res = this.perform(childNode, keyBuf, valPtr);
            
            node.children[childIdx] = res.newSeal;

            if (res.split) {
                const sRes = res.split;
                node.keys.splice(childIdx, 0, sRes.key);
                node.children.splice(childIdx + 1, 0, sRes.siblingSeal);
                
                const mySplit = this.splitLogic.check(node);
                return mySplit ? { split: mySplit, newSeal: mySplit.nodeSeal } : { newSeal: this.nodeIO.save(node) };
            }

            return { newSeal: this.nodeIO.save(node) };
        }
    }
}

module.exports = MapInsertion;
