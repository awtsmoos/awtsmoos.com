// B"H
/**
 * @file ChasveiAwtsmoos.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE WRITINGS OF THE ESSENCE — Universal Utility Vessels                 ║
 * ║                                                                          ║
 * ║  "And he wrote them upon the doorposts..."                               ║
 * ║                                                                          ║
 * ║  Provides the fundamental dynamic powers of the code, allowing           ║
 * ║  faculties to be emanated and extended without repetitive effort.        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export default class ChasveiAwtsmoos {
    /**
     * @method emanate
     * @description
     * B"H - Dynamic faculty grafting. Replaces repetitive Object.assign.
     * "Emanates" methods from sources onto a target vessel.
     * 
     * @param {Object} target - The destination (e.g., a prototype).
     * @param {Array<Object>|Object} sources - The source faculties to graft.
     */
    static emanate(target, sources) {
        const sourceArray = Array.isArray(sources) ? sources : [sources];
        sourceArray.forEach(source => {
            if (source) {
                Object.assign(target, source);
            }
        });
        return target;
    }

    /**
     * @method heHawvoos
     * @description
     * B"H - Constant Re-Creation. 
     * Applies a mapping function over a data set to generate a new existence.
     */
    static heHawvoos(data, mapper) {
        if (!data) return [];
        return (Array.isArray(data) ? data : [data]).map(mapper);
    }
}
