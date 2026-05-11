
// B"H
/**
 * @file PathHarmonizer.js
 * @brief Synchronizes client and server coordinates.
 */

export const PathHarmonizer = {
    unify(base, rel) {
        console.log("[Harmonizer] B\"H - Unifying Base[" + base + "] + Rel[" + rel + "]");

        let b = (base || "").replace(/\\/g, '/');
        let r = (rel || "").replace(/\\/g, '/');

        if (b.endsWith('/') && b.length > 1) b = b.slice(0, -1);
        if (!r.startsWith('/')) r = '/' + r;
        
        const combined = b + r;
        const final = combined.replace(/\/+/g, '/');
        
        console.log("[Harmonizer] B\"H - Final Truth: " + final);
        return final;
    }
};
