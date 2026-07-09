// B"H
/**
 * @file summaryAnchor.js
 * @description
 * Chapter 411: Before the verse opens its mouth, the Awtsmoos places a small
 * lamp. Imported section summaries belong here: not after the text, not inside
 * a paragraph, but before the verse's inline reading stream begins.
 */
const CLASS_NAME = "awtsmoos-verse-inline-summary";
const ATTR = "data-awtsmoos-verse-summary";
function verseIndex(section) {
    return section?.dataset?.awtsmoosIdx ?? section?.dataset?.idx ?? section?.getAttribute?.("data-awtsmoos-idx") ?? section?.getAttribute?.("data-idx") ?? "root";
}
function docOf(section) { return section?.ownerDocument || (typeof document !== "undefined" ? document : null); }
function firstContent(section) {
    return section?.querySelector?.(":scope > .toichen, :scope > .sub-awtsmoos, :scope > p, :scope > div:not(.marginal-gloss-shelter)") || section?.firstElementChild || null;
}
function makeAnchor(section) {
    const doc = docOf(section);
    if (!doc) return null;
    const anchor = doc.createElement("div");
    anchor.className = CLASS_NAME;
    anchor.dataset.awtsmoosVerseSummary = String(verseIndex(section));
    anchor.setAttribute(ATTR, String(verseIndex(section)));
    return anchor;
}
export function isSummarySubsection(value) {
    return String(value ?? "").trim().toLowerCase() === "summary";
}
export function findVerseSummaryAnchor(section) {
    if (!section?.querySelector) return null;
    return section.querySelector(`:scope > .${CLASS_NAME}`);
}
export function ensureVerseSummaryAnchor(section) {
    if (!section) return null;
    const existing = findVerseSummaryAnchor(section);
    if (existing) return existing;
    const anchor = makeAnchor(section);
    if (!anchor) return section;
    const before = firstContent(section);
    if (before && before.parentNode === section) section.insertBefore(anchor, before);
    else section.prepend?.(anchor) || section.appendChild(anchor);
    return anchor;
}
