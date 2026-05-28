// B"H
/**
 * @file commentCoordinate.js
 * @description
 * Chapter 3: The Awtsmoos teaches the coordinate to stop borrowing crowns. URL
 * focus may reveal a page, but placement is born only from the comment's own
 * dayuh. Top-level `sub` and `subSection` are never promoted into placement.
 */

import { getRealCommentSubSection, parseRealDayuh } from "../logic/inlineManifest/realCommentCoordinate.js";

const ROOT = "root";

function parseMaybeNumber(value, fallback = null) {
    if (value === undefined || value === null || value === "" || value === "null") return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function cleanString(value, fallback = "") {
    if (value === undefined || value === null) return fallback;
    return String(value);
}

function currentUrlValue(name) {
    const win = typeof globalThis !== "undefined" ? globalThis.window : undefined;
    const loc = win?.location || (typeof location !== "undefined" ? location : null);
    if (!loc || typeof URLSearchParams === "undefined") return null;
    const value = new URLSearchParams(loc.search).get(name);
    return value === "" ? null : value;
}

/**
 * Converts any known comment-coordinate vessel into one safe shape.
 * @param {object} [input={}] Source coordinate/dayuh/query-like object.
 * @returns {object} Normalized coordinate.
 */
export function normalizeCommentCoordinate(input = {}) {
    const dayuh = input.dayuh ? parseRealDayuh(input.dayuh) : parseRealDayuh(input);
    const win = typeof globalThis !== "undefined" ? globalThis.window : undefined;
    const sectionRaw = dayuh.verseSection ?? dayuh.section ?? dayuh.idx ?? input.verseSection ?? input.idx ?? currentUrlValue("idx") ?? ROOT;
    const section = sectionRaw === undefined || sectionRaw === null || sectionRaw === "" ? ROOT : sectionRaw;
    const subSection = parseMaybeNumber(getRealCommentSubSection({ dayuh }), null);

    const coordinate = {
        version: 1,
        heichelId: cleanString(input.heichelId ?? dayuh.heichelId ?? win?.post?.heichel?.id ?? win?.heichelId, ""),
        seriesId: cleanString(input.seriesId ?? dayuh.seriesId ?? win?.post?.parentSeriesId ?? win?.series?.id, ""),
        postId: cleanString(input.postId ?? dayuh.postId ?? win?.post?.id, ""),
        parentType: cleanString(input.parentType ?? dayuh.parentType ?? "post", "post"),
        parentId: cleanString(input.parentId ?? dayuh.parentId ?? input.postId ?? win?.post?.id, ""),
        verseSection: section === ROOT ? ROOT : parseMaybeNumber(section, section),
        subSection,
        paragraph: subSection,
        tokenStart: parseMaybeNumber(dayuh.tokenStart ?? input.tokenStart, null),
        tokenEnd: parseMaybeNumber(dayuh.tokenEnd ?? input.tokenEnd, null),
        charStart: parseMaybeNumber(dayuh.charStart ?? input.charStart, null),
        charEnd: parseMaybeNumber(dayuh.charEnd ?? input.charEnd, null),
        semanticFingerprint: cleanString(dayuh.semanticFingerprint ?? input.semanticFingerprint, "")
    };

    coordinate.key = coordinateToKey(coordinate);
    return coordinate;
}

/**
 * Stable string key for maps and inline registries.
 * @param {object} coordinate Normalized coordinate.
 * @returns {string} Stable coordinate key.
 */
export function coordinateToKey(coordinate) {
    const c = coordinate || {};
    return [
        c.heichelId || "",
        c.seriesId || "",
        c.postId || "",
        c.parentType || "post",
        c.parentId || "",
        c.verseSection ?? ROOT,
        c.subSection ?? "root",
        c.tokenStart ?? "",
        c.tokenEnd ?? ""
    ].map(value => encodeURIComponent(String(value))).join("|");
}

/**
 * Creates backward-compatible dayuh fields from a normalized coordinate.
 * @param {object} coordinate Normalized coordinate.
 * @param {object} [extra={}] Extra dayuh fields.
 * @returns {object} Dayuh object.
 */
export function coordinateToDayuh(coordinate, extra = {}) {
    const c = normalizeCommentCoordinate(coordinate || {});
    const dayuh = { ...extra };
    if (c.verseSection !== ROOT) dayuh.verseSection = c.verseSection;
    if (c.subSection !== null) dayuh.subSection = c.subSection;
    if (c.tokenStart !== null) dayuh.tokenStart = c.tokenStart;
    if (c.tokenEnd !== null) dayuh.tokenEnd = c.tokenEnd;
    if (c.charStart !== null) dayuh.charStart = c.charStart;
    if (c.charEnd !== null) dayuh.charEnd = c.charEnd;
    if (c.semanticFingerprint) dayuh.semanticFingerprint = c.semanticFingerprint;
    dayuh.coordinate = c;
    return dayuh;
}
