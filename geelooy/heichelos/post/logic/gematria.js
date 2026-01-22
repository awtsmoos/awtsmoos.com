//B"H
/**
 * @file gematria.js
 * @description B"H - The sacred calculus of creation. This module unveils the numerical soul
 * of the Hebrew letters, echoing the divine process where the Awtsmoos contracts into Sefirot,
 * giving rise to the structured, mathematical fabric of existence. Each letter is a vessel; its
 * number, a measure of the infinite light it contains.
 */

/**
 * A map of each Hebrew letter to its corresponding numerical value,
 * the primordial integers from which all of reality is spoken into being.
 * @type {Object<string, number>}
 */
const GEMATRIA_MAP = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
    'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90 // Sofit (final forms)
};

/**
 * Calculates the Gematria value of a given Hebrew string.
 * It traverses the string, summing the divine value of each letter-vessel,
 * while respectfully ignoring the mundane forms of non-sacred characters.
 * @param {string} text - The Hebrew text to analyze.
 * @returns {number} The total numerical value of the string.
 */
export function calculateGematria(text) {
    if (!text) return 0;
    return text.split('').reduce((sum, char) => {
        return sum + (GEMATRIA_MAP[char] || 0);
    }, 0);
}
