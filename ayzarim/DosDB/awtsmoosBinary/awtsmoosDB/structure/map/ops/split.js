
// B"H
/**
 * @file structure/map/ops/split.js
 * @description
 * Chapter 51: Mitosis of the Light.
 * When the Infinite expansion exceeds the finite limits of a single node, 
 * this module splits the vessel, maintaining the perfect balance of the 
 * B-Tree across multiple physical locations on disk.
 */

const SmartPointer = require('../../../utils/smartPointer/index.js');
const constants = require('../../../constants.js');

class SplitOps {
    constructor(nodeIO) {
        this.nodeIO = nodeIO;
        this.MAX_KEYS = 200; // Threshold of shattering
    }

    /**
     * @method check
     * @description Decides if a node should shatter.
     */
    check(node) {
        if (node.keys.length <= this.MAX_KEYS) return null;
        
        const mid = Math.floor(node.keys.length / 2);
        const rightKeys = node.keys.splice(mid);
        const splitKey = node.isLeaf ? rightKeys[0] : rightKeys.shift();
        
        const sibling = {
            isLeaf: node.isLeaf,
            keys: rightKeys,
            values: node.values ? node.values.splice(mid) : [],
            children: node.children ? node.children.splice(mid + (node.isLeaf ? 0 : 1)) : []
        };
        
        const sibSeal = this.nodeIO.save(sibling);
        const newSelfSeal = this.nodeIO.save(node);

        return {
            key: splitKey,
            siblingSeal: sibSeal,
            nodeSeal: newSelfSeal
        };
    }
}

module.exports = SplitOps;
