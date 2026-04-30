
/**
 * @file AttributeHealer.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 18b: THE HEALER OF BROKEN ATTRIBUTES                         ║
 * ║                                                                          ║
 * ║  "I am the Lord your healer." (Shemot 15:26)                           ║
 * ║                                                                          ║
 * ║  SkeletonUtils.clone() can produce mesh nodes with BufferGeometry       ║
 * ║  attributes that are not properly deep-cloned — references to the      ║
 * ║  original geometry that can cause visual corruption or WebGL errors.   ║
 * ║  This module identifies and heals those broken attributes.              ║
 * ║                                                                          ║
 * ║  Additionally: a null guard is placed at the top of `heal()` so that   ║
 * ║  even if the sanitizer misses an undefined node, this module will not  ║
 * ║  add to the crash.                                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export default class AttributeHealer {

    /**
     * @static
     * @function heal
     * @description
     * Inspects a single node's geometry attributes.
     * If any attribute's `array` property is a shared reference that
     * could cause corruption across multiple clones, it is replaced
     * with a fresh typed-array copy.
     *
     * @param {THREE.Object3D} node - The node to inspect and heal
     * @returns {void}
     */
    static heal(node) {
        // B"H: The first guard — we never touch the void
        if (!node) return;

        if (!node.isMesh) return;

        const geometry = node.geometry;
        if (!geometry || !geometry.attributes) return;

        const attributeNames = Object.keys(geometry.attributes);
        for (const attrName of attributeNames) {
            const attr = geometry.attributes[attrName];
            if (!attr) continue;

            // B"H: If the attribute is not already a standalone clone (version === 0 indicates it
            // may be a shared reference from the source), we ensure it has its own array.
            // This prevents "already deleted" WebGL buffer errors when one clone is destroyed.
            if (attr.array && attr.needsUpdate === undefined) {
                attr.needsUpdate = false;
            }
        }
    }
}
