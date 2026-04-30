
// B"H
/**
 * @file structure/map/ops/search.js
 * @description
 * Chapter 50: The Eye of the B-Tree.
 * This module performs the Binary Search within a single sorted node. 
 * By focusing only on search, it maintains extreme velocity and zero state.
 * 
 * Every name (key) is checked against the targets willed by the user.
 */
module.exports = {
    /**
     * @function findKey
     * @description Identifies the slot or insertion index for a buffer.
     */
    findKey(node, keyBuf) {
        let low = 0;
        let high = node.keys.length - 1;

        while (low <= high) {
            const mid = (low + high) >>> 1;
            const cmp = keyBuf.compare(node.keys[mid]);

            if (cmp === 0) return { index: mid, found: true };
            
            if (cmp < 0) high = mid - 1;
            else low = mid + 1;
        }

        return { index: low, found: false };
    }
};
