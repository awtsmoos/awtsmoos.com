
/**
 * B"H
 * @module ShieldGenerator
 * @description
 * * Chapter 4: The Invisibility Cloak
 * This module manifests the sacred interceptor script tag. 
 * This script is the "Crown" (Keter) of the iframe's intelligence,
 * allowing it to communicate its internal states back to the higher 
 * world of the editor.
 * * @param {string} shieldScript - The raw JavaScript code of the interceptor.
 * @returns {string} The HTML script tag containing the shield.
 */
export const ShieldGenerator = {
    generate(shieldScript) {
        // Fragmentation prevents the browser from finding a literal closing tag inside this string
        return "<" + "script data-merkava-internal=\"true\">" + shieldScript + "<" + "/script" + ">";
    }
};
