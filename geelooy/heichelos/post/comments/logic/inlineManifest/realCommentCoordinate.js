/**
 * B"H
 * @module RealCommentCoordinate
 * @description
 * Chapter 1: The Awtsmoos lifts the comment from the fog of borrowed names.
 * URL `sub`, wrapper `sub`, and top-level `subSection` are loud masks. This
 * module listens only for the real inner breath: `comment.dayuh.subSection`.
 */

const MAIN_SUBSECTION_NAMES = new Set(["", "main", "root", "null", "undefined"]);

/**
 * Parses a comment dayuh vessel without trusting outer coordinate echoes.
 * @param {unknown} rawDayuh The raw dayuh object or JSON text.
 * @returns {Record<string, unknown>} A plain dayuh object.
 */
export function parseRealDayuh(rawDayuh) {
    if (!rawDayuh) return {};
    if (typeof rawDayuh === "string") {
        try {
            const parsed = JSON.parse(rawDayuh);
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
    }
    return typeof rawDayuh === "object" ? rawDayuh : {};
}

/**
 * Returns true when a subsection value means the verse itself.
 * @param {unknown} value Possible subsection marker.
 * @returns {boolean} Whether the value is absent or root-like.
 */
export function isRootLikeSubsection(value) {
    if (value === undefined || value === null) return true;
    return MAIN_SUBSECTION_NAMES.has(String(value).trim());
}

/**
 * Reads the only subsection field allowed to control placement.
 * @param {object} comment Comment-like object containing `dayuh`.
 * @returns {string|number|null} The real subsection, or null for verse-level.
 */
export function getRealCommentSubSection(comment = {}) {
    const dayuh = parseRealDayuh(comment?.dayuh);
    if (!Object.prototype.hasOwnProperty.call(dayuh, "subSection")) return null;
    return isRootLikeSubsection(dayuh.subSection) ? null : dayuh.subSection;
}

/**
 * Finds the verse section owned by the comment dayuh, with request fallback.
 * @param {object} comment Comment-like object.
 * @param {string|number|null} fallbackVerse Verse from the request loop.
 * @returns {string|number|null} Verse coordinate.
 */
export function getCommentVerseSection(comment = {}, fallbackVerse = null) {
    const dayuh = parseRealDayuh(comment?.dayuh);
    if (dayuh.verseSection !== undefined && dayuh.verseSection !== null && dayuh.verseSection !== "") {
        return dayuh.verseSection;
    }
    if (comment?.verseSection !== undefined && comment?.verseSection !== null && comment?.verseSection !== "") {
        return comment.verseSection;
    }
    return fallbackVerse;
}

/**
 * Determines whether the comment belongs beside one subsection.
 * @param {object} comment Comment-like object.
 * @returns {boolean} True only when `dayuh.subSection` is specific.
 */
export function isSpecificSubsectionComment(comment = {}) {
    return getRealCommentSubSection(comment) !== null;
}

/**
 * Determines whether the comment must sit once at verse-end.
 * @param {object} comment Comment-like object.
 * @returns {boolean} True when no specific `dayuh.subSection` exists.
 */
export function isVerseLevelComment(comment = {}) {
    return !isSpecificSubsectionComment(comment);
}

/**
 * Builds safe placement dayuh without promoting poisoned top-level fields.
 * @param {object} comment Comment-like object.
 * @param {string|number|null} fallbackVerse Request verse.
 * @returns {object} Clean dayuh for inline placement.
 */
export function buildRealPlacementDayuh(comment = {}, fallbackVerse = null) {
    const dayuh = { ...parseRealDayuh(comment?.dayuh) };
    const verseSection = getCommentVerseSection(comment, fallbackVerse);
    const subSection = getRealCommentSubSection({ dayuh });

    if (verseSection !== null && verseSection !== undefined) dayuh.verseSection = verseSection;
    if (subSection === null) delete dayuh.subSection;
    else dayuh.subSection = subSection;
    return dayuh;
}
