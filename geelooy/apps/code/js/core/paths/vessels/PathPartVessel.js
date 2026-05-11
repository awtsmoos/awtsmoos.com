
// B"H
/**
 * @file PathPartVessel.js
 * @brief THE ARCHETYPE OF THE MEASURED JOURNEY.
 * 
 * THE POEM OF THE FRAGMENTED LETTERS:
 * In the beginning, the Word was One, but to create the world, 
 * it was split into twenty-two letters. So too, a path is not a 
 * single stone, but a sequence of steps. Each segment is a station, 
 * a harbor in the sea of data. 
 * 
 * We represent the path not as a messy string of the earth, 
 * but as a pure Array—a Seder (Order) of segments. 
 * Whether the separator be the slash of the heavens or the 
 * backslash of the deep, it is all dissolved into the 
 * primordial elements of the parts.
 * 
 * Like it says: "By the Word of the Lord were the heavens made." 
 * Every segment here is a word in the utterance that locates 
 * a vessel in the digital firmament.
 */

/**
 * @class PathPartVessel
 * @description A data-centric vessel holding the atomized parts of a coordinate.
 */
export class PathPartVessel {
    /**
     * B"H
     * @param {string[]} parts - The array of path segments.
     * @param {boolean} isAbsolute - Whether this path is anchored to the root.
     */
    constructor(parts, isAbsolute = true) {
        /** @type {string[]} */
        this.parts = parts || [];
        /** @type {boolean} */
        this.isAbsolute = isAbsolute;
    }

    /**
     * B"H - Returns the count of steps in this journey.
     * @returns {number}
     */
    get length() {
        return this.parts.length;
    }

    /**
     * B"H - Accesses a specific station by index.
     * @param {number} index 
     * @returns {string}
     */
    at(index) {
        return this.parts[index];
    }
}
