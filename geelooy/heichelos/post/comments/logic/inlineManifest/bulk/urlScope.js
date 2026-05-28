/**
 * B"H
 * @module InlineUrlScope
 * @description
 * The visible page may focus on one subsection, but verse-level comments still
 * belong to the verse-end cluster. Only `dayuh.subSection` makes a comment local
 * to a paragraph. Top-level `sub` echoes are ignored here.
 */

export function getScopedQueryValue(name) {
    const value = new URLSearchParams(location.search).get(name);
    return value === null || value === "" ? null : String(value);
}

export function getRequestedVerseSection() {
    return getScopedQueryValue("idx");
}

export function getRequestedSubSection() {
    return getScopedQueryValue("sub");
}

export function isMainSubsection(sub) {
    return sub === undefined || sub === null || sub === "" || sub === "main" || sub === "root";
}

function dayuhOf(spark) {
    const raw = spark?.dayuh;
    if (!raw) return {};
    if (typeof raw === "string") {
        try { return JSON.parse(raw) || {}; } catch { return {}; }
    }
    return typeof raw === "object" ? raw : {};
}

function sparkVerse(spark) {
    const dayuh = dayuhOf(spark);
    return dayuh.verseSection ?? spark?.verseSection ?? null;
}

function sparkSub(spark) {
    return dayuhOf(spark).subSection;
}

export function sparkMatchesUrlScope(spark) {
    const requestedVerse = getRequestedVerseSection();
    const requestedSub = getRequestedSubSection();
    const verse = sparkVerse(spark);
    const sub = sparkSub(spark);

    if (requestedVerse !== null && String(verse) !== requestedVerse) return false;
    if (requestedSub !== null) return String(sub) === requestedSub || isMainSubsection(sub);
    return isMainSubsection(sub);
}

export function filterSparksToUrlScope(sparks) {
    const requestedVerse = getRequestedVerseSection();
    const requestedSub = getRequestedSubSection();
    if (requestedVerse === null && requestedSub === null) return sparks;
    return sparks.filter(sparkMatchesUrlScope);
}
