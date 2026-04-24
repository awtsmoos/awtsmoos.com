
/**
 * B"H
 * @module LanguageSentinel
 * @description 
 * Every language has a different spiritual weight. 
 * This sentinel identifies the Hebrew letters, ensuring 
 * the scroll unrolls in the correct direction.
 */

/**
 * @function isHebrew
 * @description Determines if the spark of text contains the sacred tongue.
 * @param {string} text - The text to evaluate.
 * @returns {boolean} - True if Hebrew letters are manifest.
 */
export function isHebrew(text) {
    if (!text) return false;
    // B"H - The range of the Holy Letters (Hebrew Unicode)
    const hebrewPattern = /[\u0590-\u05FF]/;
    return hebrewPattern.test(text);
}

/**
 * @function getDirection
 * @description Returns the CSS direction for a block of text.
 */
export function getDirection(text) {
    return isHebrew(text) ? "rtl" : "ltr";
}
