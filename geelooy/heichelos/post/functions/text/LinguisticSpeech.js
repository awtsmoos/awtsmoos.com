
/**
 * B"H
 * @module LinguisticSpeech
 * @chapter The Differentiation of the Speech
 * @description
 * Just as the original Speech of the Creator was one, but then 
 * differentiated into many branches to fill the physical worlds, 
 * this module identifies the roots of the letters. 
 * 
 * It determines whether a string of characters (Otiyot) carries the 
 * specific vibration of the Hebrew language—the channel through which 
 * reality is refreshed every second—or whether it belongs to the 
 * expansive reach of the mundane tongues.
 */

/**
 * @function isHebrewWord
 * @description
 * Tests if a singular vessel of wordiness consists entirely of Hebrew sparks.
 * 
 * @param {string} word - The unit to test.
 * @returns {boolean} - True if the vibration matches the holy range.
 */
export function isHebrewWord(word) {
    // B"H - Mapping the Unicode span where the holy letters dwell
    return /^[א-ת\u0590-\u05FF]+$/.test(word);
}

/**
 * @function isFirstCharacterHebrew
 * @description
 * Analyzes the very first significant spark of a string to see 
 * if it leads with a Hebrew vibration. Important for Seder 
 * Histalshelus (layout alignment).
 * 
 * @param {string} str - The sequence to analyze.
 * @returns {boolean} - True if the leader of the sequence is Hebrew.
 */
export function isFirstCharacterHebrew(str) {
    if (!str) return false;
    const match = str.match(/[\S]/);
    if (!match) return false;
    const charCode = match[0].charCodeAt(0);
    return charCode >= 0x0590 && charCode <= 0x05FF;
}

/**
 * @function containsHebrew
 * @description
 * Searches through an entire expanse of text to see if even a single 
 * Hebrew letter exists within it—a small point of infinite light.
 * 
 * @param {string} str - The expanse to search.
 * @returns {boolean} - True if at least one holy spark is manifest.
 */
export function containsHebrew(str) {
    if (!str) return false;
    return /[\u0590-\u05FF]/.test(str);
}
