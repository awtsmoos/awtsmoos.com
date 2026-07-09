// B"H
/**
 * @file commentCoordinate.js
 * @description
 * Chapter 413: Coordinates now carry one more secret: summaries are still tied
 * to a verse, but they sit before the verse content. Top-level `sub` remains a
 * false crown; only real dayuh creates placement.
 */
import { getCommentPlacementKind, getRealCommentSubSection, parseRealDayuh } from "../logic/inlineManifest/realCommentCoordinate.js";
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
function dayuhOf(input) { return input.dayuh ? parseRealDayuh(input.dayuh) : parseRealDayuh(input); }
function sectionOf(dayuh, input, win) {
    const raw = dayuh.verseSection ?? dayuh.section ?? dayuh.idx ?? input.verseSection ?? input.idx ?? currentUrlValue("idx") ?? ROOT;
    return raw === undefined || raw === null || raw === "" ? ROOT : raw;
}
export function normalizeCommentCoordinate(input = {}) {
    const dayuh = dayuhOf(input);
    const win = typeof globalThis !== "undefined" ? globalThis.window : undefined;
    const section = sectionOf(dayuh, input, win);
    const placementKind = getCommentPlacementKind({ dayuh });
    const subSection = parseMaybeNumber(getRealCommentSubSection({ dayuh }), null);
    const coordinate = {
        version: 2,
        placementKind,
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
export function coordinateToKey(coordinate) {
    const c = coordinate || {};
    return [c.heichelId || "", c.seriesId || "", c.postId || "", c.parentType || "post", c.parentId || "", c.verseSection ?? ROOT, c.placementKind || "comment", c.subSection ?? "root", c.tokenStart ?? "", c.tokenEnd ?? ""].map(value => encodeURIComponent(String(value))).join("|");
}
export function coordinateToDayuh(coordinate, extra = {}) {
    const c = normalizeCommentCoordinate(coordinate || {});
    const dayuh = { ...extra };
    if (c.verseSection !== ROOT) dayuh.verseSection = c.verseSection;
    if (c.placementKind === "summary") { dayuh.subSection = "summary"; dayuh.placementKind = "summary"; }
    else if (c.subSection !== null) dayuh.subSection = c.subSection;
    if (c.tokenStart !== null) dayuh.tokenStart = c.tokenStart;
    if (c.tokenEnd !== null) dayuh.tokenEnd = c.tokenEnd;
    if (c.charStart !== null) dayuh.charStart = c.charStart;
    if (c.charEnd !== null) dayuh.charEnd = c.charEnd;
    if (c.semanticFingerprint) dayuh.semanticFingerprint = c.semanticFingerprint;
    dayuh.coordinate = c;
    return dayuh;
}
