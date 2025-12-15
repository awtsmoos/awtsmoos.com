/*
B"H
Boruch Hashem
Biezrash Hashem
*/
/**
 * Utility functions for the Awtsmoos Compiler.
 */

/**
 * Aligns a value to the specified boundary.
 * @param {number} val - The value to align.
 * @param {number} alignment - The alignment boundary (must be power of 2).
 * @returns {number} The aligned value.
 */
export function align(val, alignment) {
    return (val + alignment - 1) & ~(alignment - 1);
}

/**
 * Creates a buffer for an ASCII/UTF-8 string.
 * @param {string} str 
 * @returns {Uint8Array}
 */
export function stringToBytes(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}
