
// B"H
/**
 * @file resolver_core/utils.js
 * @description
 * The Scribe of Names.
 * Every structural vessel needs a unique ID for the Circular Cache. 
 * We use the Exact physical coordinates as the name.
 */
module.exports = {
    /**
     * @method getAddrKey
     * @description Forges a cache key: "Offset:Length"
     */
    getAddrKey(ptr) {
        if (!ptr) return "0:0";
        const o = ptr.offset || 0;
        const l = ptr.length || 0;
        return `${o}:${l}`;
    }
};
