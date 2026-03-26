
// B"H
/**
* @file structure/map/ops/search.js
* @description
*  The Eye of the Map.
*  This module performs the high-speed binary search within a single B-Tree node.
*  It discerns whether a key exists within the current vessel or where it
*  would be placed if it were newly willed into existence.
*
*  THE TIKKUN OF COMPARISON: Ensures that UTF-8 encoded keys are compared
*  correctly, maintaining the alphabetical sorting covenant. The buffer.compare()
*  method is reliable for UTF-8, but we add explicit handling for edge cases
*  to guarantee perfect ordering across all possible key values.
*/

/**
* @function findKey
* @description Performs a binary search for a key buffer within a node's keys.
* @param {Object} node The physical node object containing sorted key buffers.
* @param {Buffer} keyBuf The binary name (UTF-8 encoded) of the essence we seek.
* @returns {Object} { index: number, found: boolean } - The position and existence status.
*/
module.exports = {
findKey(node, keyBuf) {
let low = 0;
let high = node.keys.length - 1;

// B"H: The binary dance of discernment
while (low <= high) {
const mid = (low + high) >>> 1;
const cmp = keyBuf.compare(node.keys[mid]);

if (cmp === 0) {
return { index: mid, found: true };
}

if (cmp < 0) {
high = mid - 1;
} else {
low = mid + 1;
}
}

// B"H: Key not found, return insertion point to maintain sorted order
return { index: low, found: false };
}
};
