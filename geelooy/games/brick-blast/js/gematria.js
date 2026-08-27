// B"H

/**
 * This module contains the sacred knowledge of Gematria, the transmutation of number into letter.
 * It is a reflection of the hidden unity within creation, where quantity and concept are one.
 */

const GEMATRIA_MAP = {
    1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט',
    10: 'י', 20: 'כ', 30: 'ל', 40: 'מ', 50: 'נ', 60: 'ס', 70: 'ע', 80: 'פ', 90: 'צ',
    100: 'ק', 200: 'ר', 300: 'ש', 400: 'ת'
};

const ORDERED_VALUES = Object.keys(GEMATRIA_MAP).map(Number).sort((a, b) => b - a);

/**
 * Converts a given number into its Hebrew Gematria representation.
 * Handles special cases for 15 and 16 to avoid writing divine names.
 * @param {number} num The number to convert.
 * @returns {string} The Hebrew Gematria string.
 */
export function convertToGematria(num) {
    if (num <= 0) return '';
    // Use the correct Hebrew Gershayim (U+05F4) for the special cases.
    if (num === 15) return 'ט״ו';
    if (num === 16) return 'ט״ז';

    let remaining = num;
    let hebrewString = '';

    for (const value of ORDERED_VALUES) {
        while (remaining >= value) {
            hebrewString += GEMATRIA_MAP[value];
            remaining -= value;
        }
    }
    
    // Add the true Gershayim (U+05F4) for multi-letter representations.
    if (hebrewString.length > 1) {
        hebrewString = hebrewString.slice(0, -1) + '״' + hebrewString.slice(-1);
    }

    return hebrewString;
}