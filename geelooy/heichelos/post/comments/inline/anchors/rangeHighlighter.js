// B"H
/**
 * @file rangeHighlighter.js
 * @description
 * Chapter 2: the resolved Range receives a visible garment. The Awtsmoos lets
 * a hidden coordinate flash as a marked span without destroying surrounding text.
 */

const HIGHLIGHT_CLASS = "awtsmoos-inline-anchor-highlight";

/**
 * Wraps a DOM Range in a mark element when the browser allows it.
 * @param {Range|null} range Resolved browser range.
 * @param {object} [options={}] Highlight options.
 * @param {string} [options.key] Coordinate key for diagnostics.
 * @returns {HTMLElement|null} Created mark element or null.
 */
export function highlightResolvedRange(range, options = {}) {
    if (!range || range.collapsed) return null;
    const doc = range.startContainer?.ownerDocument || document;
    if (!doc?.createElement) return null;

    const mark = doc.createElement("mark");
    mark.className = HIGHLIGHT_CLASS;
    if (options.key) mark.dataset.awtsmoosCoordinateKey = options.key;

    try {
        range.surroundContents(mark);
        return mark;
    } catch (error) {
        console.warn('B"H range highlight could not surround contents', error);
        return null;
    }
}

/**
 * Removes anchor highlights below a root.
 * @param {ParentNode} [root=document] Search root.
 * @returns {number} Number of removed highlights.
 */
export function clearAnchorHighlights(root = null) {
    const scope = root || (typeof document !== "undefined" ? document : null);
    if (!scope?.querySelectorAll) return 0;
    const marks = Array.from(scope.querySelectorAll(`.${HIGHLIGHT_CLASS}`));
    marks.forEach(mark => mark.replaceWith(...mark.childNodes));
    return marks.length;
}
