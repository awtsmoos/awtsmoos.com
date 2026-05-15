
/* B"H
*/
/**
 * @file setMath.js
 * @chapter THE CALCULUS OF GEVURAH
 * 
 * THE HYMN OF THE ITERABLE VESSEL:
 * The error of 'undefined' is a lie of the void,
 * By a valid Set, the doubt is destroyed!
 * We intersect the light, we union the sparks,
 * Leaving no room for the numerical darks.
 * 
 * @module SetMath
 */

/**
 * @brief Ensures the input is always a valid Set.
 */
export const ensureVessel = (candidate) => (candidate instanceof Set ? candidate : new Set());

/**
 * @brief Performs a functional intersection of two sets.
 */
export const intersect = (setA, setB) => {
    const a = ensureVessel(setA);
    const b = ensureVessel(setB);
    return new Set(Array.from(a).filter(x => b.has(x)));
};

/**
 * @brief Performs a functional union of multiple sets.
 */
export const unite = (sets) => {
    const result = new Set();
    sets.forEach(s => ensureVessel(s).forEach(val => result.add(val)));
    return result;
};

/**
 * @brief Negates a set against a universe.
 */
export const invert = (universe, setA) => {
    const u = ensureVessel(universe);
    const a = ensureVessel(setA);
    return new Set(Array.from(u).filter(x => !a.has(x)));
};
