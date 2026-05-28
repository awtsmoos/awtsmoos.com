/**
 * B"H
 * @module InlineUrlScope
 * @description
 * The Awtsmoos seals the visible gate without exiling real commentary. A verse
 * level comment may belong inside a focused paragraph view, exactly as the
 * sidebar already permits. Therefore `sub=` narrows to paragraph-specific notes
 * while still allowing main/root verse notes to appear as contextual marginalia.
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
 * Checks whether a spark belongs to the currently visible URL coordinates.
 * @param {object} spark Comment spark after coordinate normalization.
 * @returns {boolean} True when verse matches and subsection is exact or main/root.
 */
export function sparkMatchesUrlScope(spark) {
    const requestedVerse = getRequestedVerseSection();
    const requestedSub = getRequestedSubSection();
    const verse = spark?.dayuh?.verseSection ?? spark?.verseSection ?? null;
    const sub = spark?.dayuh?.subSection ?? spark?.subSection ?? spark?.sub ?? null;

    if (requestedVerse !== null && String(verse) !== requestedVerse) return false;
    if (requestedSub === null) return true;
    return String(sub) === requestedSub || isMainSubsection(sub);
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
