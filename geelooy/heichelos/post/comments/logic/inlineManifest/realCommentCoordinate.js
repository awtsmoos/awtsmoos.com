/**
 * B"H
 * @module RealCommentCoordinate
 * @description
 * Chapter 412: A summary is not a paragraph and not the verse end. The
 * Awtsmoos names it as a lamp-before-the-gate, while still listening only to
 * the real `comment.dayuh` vessel for placement truth.
 */
const MAIN_SUBSECTION_NAMES = new Set(["", "main", "root", "null", "undefined"]);
const SUMMARY_MARKERS = new Set(["summary", "section-summary", "verse-summary"]);
export function parseRealDayuh(rawDayuh) {
    if (!rawDayuh) return {};
    if (typeof rawDayuh === "string") {
        try { const parsed = JSON.parse(rawDayuh); return parsed && typeof parsed === "object" ? parsed : {}; }
        catch { return {}; }
    }
    return typeof rawDayuh === "object" ? rawDayuh : {};
}
export function isSummarySubSection(value) {
    return SUMMARY_MARKERS.has(String(value ?? "").trim().toLowerCase());
}
export function isRootLikeSubsection(value) {
    if (value === undefined || value === null) return true;
    const clean = String(value).trim().toLowerCase();
    return MAIN_SUBSECTION_NAMES.has(clean) || isSummarySubSection(clean);
}
export function getRealCommentSubSection(comment = {}) {
    const dayuh = parseRealDayuh(comment?.dayuh);
    if (!Object.prototype.hasOwnProperty.call(dayuh, "subSection")) return null;
    return isRootLikeSubsection(dayuh.subSection) ? null : dayuh.subSection;
}
export function getCommentPlacementKind(comment = {}) {
    const dayuh = parseRealDayuh(comment?.dayuh);
    return isSummarySubSection(dayuh.subSection) ? "summary" : "comment";
}
export function getCommentVerseSection(comment = {}, fallbackVerse = null) {
    const dayuh = parseRealDayuh(comment?.dayuh);
    if (dayuh.verseSection !== undefined && dayuh.verseSection !== null && dayuh.verseSection !== "") return dayuh.verseSection;
    if (comment?.verseSection !== undefined && comment?.verseSection !== null && comment?.verseSection !== "") return comment.verseSection;
    return fallbackVerse;
}
export function isSpecificSubsectionComment(comment = {}) { return getRealCommentSubSection(comment) !== null; }
export function isVerseLevelComment(comment = {}) { return !isSpecificSubsectionComment(comment) && getCommentPlacementKind(comment) !== "summary"; }
export function buildRealPlacementDayuh(comment = {}, fallbackVerse = null) {
    const dayuh = { ...parseRealDayuh(comment?.dayuh) };
    const verseSection = getCommentVerseSection(comment, fallbackVerse);
    const subSection = getRealCommentSubSection({ dayuh });
    const placementKind = getCommentPlacementKind({ dayuh });
    if (verseSection !== null && verseSection !== undefined) dayuh.verseSection = verseSection;
    if (placementKind === "summary") { dayuh.subSection = "summary"; dayuh.placementKind = "summary"; }
    else if (subSection === null) delete dayuh.subSection;
    else dayuh.subSection = subSection;
    return dayuh;
}
