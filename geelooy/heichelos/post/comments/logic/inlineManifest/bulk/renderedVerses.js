/**
 * B"H
 * @module InlineRenderedVerses
 * @description
 * Chapter 7: The Awtsmoos counts every visible verse before any spark is fetched.
 * No lazy scroll, no URL narrowing, no subsection-by-subsection guessing; the
 * whole rendered page becomes the request constellation.
 */

const VERSE_SELECTOR = ".post-reader-localized-context .section[data-awtsmoos-idx], .post-reader-localized-context .section[data-idx]";

/**
 * Reads the physical verse indices currently rendered in the DOM.
 * @param {ParentNode} [root=document] DOM root.
 * @returns {string[]} Unique rendered verse indices in DOM order.
 */
export function getPhysicalVerseIndices(root = document) {
    if (!root || typeof root.querySelectorAll !== "function") return [];
    const verseElements = root.querySelectorAll(VERSE_SELECTOR);
    return Array.from(verseElements)
        .map(el => el.dataset?.awtsmoosIdx || el.dataset?.idx)
        .filter((value, index, list) => value !== undefined && value !== null && list.indexOf(value) === index);
}
