/**
 * B"H
 * @module InlineRenderedVerses
 * @description
 * Chapter 203: The reader remains mostly untouched, but inline comments no
 * longer forget the root altar. Every page-wide inline request includes `root`
 * first, then every rendered verse. URL subsection focus still never narrows
 * inline manifestation; it only guides placement after all sparks are present.
 */

const VERSE_SELECTOR = [
    ".post-reader-localized-context .section[data-awtsmoos-idx]",
    ".post-reader-localized-context .section[data-idx]",
    ".post-reader-localized-context .section[data-verse-section]"
].join(", ");

function unique(values) {
    const seen = new Set();
    return values.filter(value => {
        const key = String(value);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function coordinateOf(element) {
    return element.dataset?.awtsmoosIdx || element.dataset?.idx || element.dataset?.verseSection;
}

/**
 * Reads the physical verse indices currently rendered in the DOM.
 * @param {ParentNode} [root=document] DOM root.
 * @returns {string[]} Unique rendered verse indices in DOM order, with root.
 */
export function getPhysicalVerseIndices(root = document) {
    if (!root || typeof root.querySelectorAll !== "function") return ["root"];
    const verseElements = root.querySelectorAll(VERSE_SELECTOR);
    const rendered = Array.from(verseElements).map(coordinateOf).filter(value => value !== undefined && value !== null && value !== "");
    return unique(["root", ...rendered]);
}
