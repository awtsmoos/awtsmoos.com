/**
 * B"H
 * @module InlineUrlScope
 * @description
 * Chapter 3: The Awtsmoos seals the visible gate. Verse section zero is a real
 * chamber, not root. Only missing coordinates become root; `idx=0` remains the
 * first verse vessel, and `sub=1` narrows that vessel to its named paragraph.
 */

/**
 * Reads one query value without collapsing "0" into absence.
 * @param {string} name Query parameter name.
 * @returns {string|null} String value, including "0", or null when absent/empty.
 */
export function getScopedQueryValue(name) {
    const value = new URLSearchParams(location.search).get(name);
    return value === null || value === "" ? null : String(value);
}

/** @returns {string|null} Requested verse index; "0" is preserved. */
export function getRequestedVerseSection() {
    return getScopedQueryValue("idx");
}

/** @returns {string|null} Requested subsection; "0" is preserved. */
export function getRequestedSubSection() {
    return getScopedQueryValue("sub");
}

/**
 * Checks whether a spark belongs to the currently visible URL coordinates.
 * @param {object} spark Comment spark after coordinate normalization.
 * @returns {boolean} True only when verse and subsection constraints match.
 */
export function sparkMatchesUrlScope(spark) {
    const requestedVerse = getRequestedVerseSection();
    const requestedSub = getRequestedSubSection();
    const verse = spark?.dayuh?.verseSection ?? spark?.verseSection ?? null;
    const sub = spark?.dayuh?.subSection ?? spark?.subSection ?? spark?.sub ?? null;

    if (requestedVerse !== null && String(verse) !== requestedVerse) return false;
    if (requestedSub !== null && (sub === null || String(sub) !== requestedSub)) return false;
    return true;
}

/**
 * Filters converged sparks to the exact visible verse/subsection scope.
 * @param {Array<object>} sparks Unique comment sparks.
 * @returns {Array<object>} Sparks allowed in the current URL scope.
 */
export function filterSparksToUrlScope(sparks) {
    const requestedVerse = getRequestedVerseSection();
    const requestedSub = getRequestedSubSection();
    if (requestedVerse === null && requestedSub === null) return sparks;
    return sparks.filter(sparkMatchesUrlScope);
}
