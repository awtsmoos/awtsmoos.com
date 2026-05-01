
/**
 * B"H
 * @module CoordinateState
 * @chapter The Boundaries of the Manifest Scroll
 * @description
 * "He set a boundary for the sea" (Proverbs 8:29). 
 * Space is not a vacuum but a series of precise locations created 
 * by the Speech of the Awtsmoos. This module tracks the Seeker's 
 * focus within the Verse (Index) and Paragraph (Sub).
 */

/** @type {string|number} */
let verseCoord = "root";
/** @type {number|null} */
let subCoord = null;

/**
 * @function setCurrentVerse
 * @description Anchors the seeker's consciousness in a specific Verse.
 * @param {string|number} v - The coordinate of the Verse.
 */
export function setCurrentVerse(v) {
    verseCoord = (v === null || v === undefined) ? "root" : v;
    console.log(`B"H - [State:Coordinates] Verse focused at: ${verseCoord}`);
}

/**
 * @function getCurrentVerse
 * @description Recalls the Verse currently illuminated by the Light of focus.
 * @returns {string|number}
 */
export function getCurrentVerse() {
    return verseCoord;
}

/**
 * @function setCurrentSub
 * @description Anchors the seeker's consciousness in a specific Sub-section (Paragraph).
 * @param {number|null|string} s - The particular sub-coordinate.
 */
export function setCurrentSub(s) {
    // Treat 'null' string as actual null
    subCoord = (s === "null" || s === undefined || s === null) ? null : parseInt(s);
    console.log(`B"H - [State:Coordinates] Sub-verse focused at: ${subCoord}`);
}

/**
 * @function getCurrentSub
 * @description Recalls the Paragraph currently manifest in the Seeker's mind.
 * @returns {number|null}
 */
export function getCurrentSub() {
    return subCoord;
}
