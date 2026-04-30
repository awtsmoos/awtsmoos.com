
// B"H
/**
 * @file primitives.js
 * @description Identifies the leaves of the Tree of Life.
 */
module.exports = {
    handlePrimitive(val) {
        return Buffer.isBuffer(val) || 
               ArrayBuffer.isView(val) || 
               val instanceof ArrayBuffer || 
               val instanceof Date || 
               val instanceof RegExp || 
               val instanceof Error;
    }
};
