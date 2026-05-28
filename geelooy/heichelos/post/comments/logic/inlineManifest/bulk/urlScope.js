/**
 * B"H
 * @module InlineUrlScope
 * @description
 * The Awtsmoos gives each paragraph its own vessel. When the URL has `sub=1`,
 * inline commentary must not pour every verse-level or sibling paragraph note
 * into that vessel. Exact subsection matching is the default; only comments with
 * no subsection are allowed when no subsection is requested.
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
 * @param {unknown} sub Candidate subsection marker.
 * @returns {boolean} True when the comment is verse-level/main/root context.
 */
export function isMainSubsection(sub) {
    return sub === undefined || sub === null || sub === "" || sub === "main" || sub === "root";
}

/**
 * Checks whether a spark belongs to the current URL coordinates.
 * @param {object} spark Comment spark after coordinate normalization.
 * @returns {boolean} True only for the requested verse and requested subsection.
 */
export function sparkMatchesUrlScope(spark) {
    const requestedVerse = getRequestedVerseSection();
    const requestedSub = getRequestedSubSection();
    const verse = spark?.dayuh?.verseSection ?? spark?.verseSection ?? null;
    const sub = spark?.dayuh?.subSection ?? spark?.subSection ?? spark?.sub ?? null;

    if (requestedVerse !== null && String(verse) !== requestedVerse) return false;
    if (requestedSub !== null) return String(sub) === requestedSub;
    return isMainSubsection(sub);
}

/**
 * Filters converged sparks to the visible verse/subsection scope.
 * @param {Array<object>} sparks Unique comment sparks.
 * @returns {Array<object>} Sparks allowed in the current URL scope.
 */
export function filterSparksToUrlScope(sparks) {
    const requestedVerse = getRequestedVerseSection();
    const requestedSub = getRequestedSubSection();
    if (requestedVerse === null && requestedSub === null) return sparks;
    return sparks.filter(sparkMatchesUrlScope);
}
