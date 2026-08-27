
// B"H
/**
 * @file PathResolver.js
 * @brief THE UNION OF THE HEAVENS AND THE EARTH.
 * 
 * THE POEM OF Jacob'S LADDER:
 * Jacob's ladder had its feet upon the ground, 
 * but its top reached the heavens. 
 * The Base Path is the ground; the Relative Path is the 
 * reaching hand. 
 * 
 * This Resolver unites the two. It looks for where 
 * the base ends and the intent begins. If they overlap—
 * if the foot is already on a higher rung—it splices 
 * them perfectly together. If the reaching hand is 
 * independent, it joins them in sequence. 
 * 
 * The result is a single, unified PathPartVessel, 
 * a complete roadmap of the Seder Hishtalshelus.
 */

import { PathPartVessel } from '../vessels/PathPartVessel.js';

/**
 * @class PathResolver
 * @description Unites base and relative coordinate arrays.
 */
export class PathResolver {
    /**
     * B"H - Combines two vessels into one definitive truth.
     * @param {PathPartVessel} baseVessel 
     * @param {PathPartVessel} relVessel 
     * @returns {PathPartVessel}
     */
    static resolve(baseVessel, relVessel) {
        // 1. ABSOLUTE OVERRIDE
        // If the relative path claims to be absolute, it abandons its parent.
        if (relVessel.isAbsolute) {
            return relVessel;
        }

        const baseParts = baseVessel.parts;
        const relParts = relVessel.parts;

        // 2. THE SEARCH FOR THE OVERLAP
        // Does the relative path repeat the ending of the base?
        // e.g. Base: [src, utils], Rel: [utils, math.js] -> [src, utils, math.js]
        let overlapIndex = -1;
        const lastBasePart = baseParts[baseParts.length - 1];

        if (lastBasePart) {
            for (let i = 0; i < relParts.length; i++) {
                if (relParts[i] === lastBasePart) {
                    overlapIndex = i;
                    break;
                }
            }
        }

        let combined;
        if (overlapIndex !== -1) {
            // Splicing at the point of unity.
            combined = baseParts.concat(relParts.slice(overlapIndex + 1));
        } else {
            // Sequential addition.
            combined = baseParts.concat(relParts);
        }

        return new PathPartVessel(combined, true);
    }
}
