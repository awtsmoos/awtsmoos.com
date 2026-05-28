// B"H
/**
 * @file verseEndAnchor.js
 * @description
 * Chapter 4: At the end of the verse the Awtsmoos opens a quiet courtyard.
 * Verse-level comments do not cling to paragraphs; they gather here once, after
 * every subsection has spoken and before the section closes its gates.
 */

const END_CLASS = "awtsmoos-verse-inline-end";
const END_ATTR = "data-awtsmoos-verse-end";

function verseIndex(section) {
    return section?.dataset?.awtsmoosIdx
        ?? section?.dataset?.idx
        ?? section?.getAttribute?.("data-awtsmoos-idx")
        ?? section?.getAttribute?.("data-idx")
        ?? "root";
}

function ownerFactory(section) {
    return section?.ownerDocument || (typeof document !== "undefined" ? document : null);
}

function makeEnd(section) {
    const doc = ownerFactory(section);
    if (!doc || typeof doc.createElement !== "function") return null;
    const end = doc.createElement("div");
    end.className = END_CLASS;
    end.dataset.awtsmoosVerseEnd = String(verseIndex(section));
    end.setAttribute(END_ATTR, String(verseIndex(section)));
    return end;
}

/**
 * Finds an existing verse-end anchor in a section.
 * @param {Element} section Verse section element.
 * @returns {Element|null} Existing anchor or null.
 */
export function findVerseEndAnchor(section) {
    if (!section || typeof section.querySelector !== "function") return null;
    return section.querySelector(`.${END_CLASS}`);
}

/**
 * Ensures a section has a single verse-end inline anchor.
 * @param {Element} section Verse section element.
 * @returns {Element|null} Verse-end element.
 */
export function ensureVerseEndAnchor(section) {
    if (!section) return null;
    const existing = findVerseEndAnchor(section);
    if (existing) return existing;
    const end = makeEnd(section);
    if (!end || typeof section.appendChild !== "function") return section;
    section.appendChild(end);
    return end;
}
