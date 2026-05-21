// B"H
/**
 * @file textRanges.js
 * @description
 * Chapter 1 continues: letters fall like sparks through DOM text nodes. This
 * module counts them gently, so a coordinate can become a browser Range.
 */

function numberOrNull(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function collectTextNodes(root) {
    if (!root) return [];
    const doc = root.ownerDocument || (typeof document !== "undefined" ? document : null);
    if (!doc) return [];
    if (!doc.createTreeWalker) return [];
    const filter = doc.defaultView?.NodeFilter || globalThis.NodeFilter;
    if (!filter) return [];
    const walker = doc.createTreeWalker(root, filter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
}

function offsetToNode(nodes, offset) {
    let seen = 0;
    for (const node of nodes) {
        const length = node.nodeValue.length;
        if (offset <= seen + length) {
            return { node, offset: Math.max(0, offset - seen) };
        }
        seen += length;
    }
    const last = nodes[nodes.length - 1];
    return last ? { node: last, offset: last.nodeValue.length } : null;
}

/**
 * Creates a DOM Range from character offsets inside an element.
 * @param {Element} element Text-bearing element.
 * @param {number} charStart Inclusive character start.
 * @param {number} charEnd Exclusive character end.
 * @returns {Range|null} Browser range or null.
 */
export function createCharacterRange(element, charStart, charEnd) {
    const start = numberOrNull(charStart);
    const end = numberOrNull(charEnd);
    if (!element || start === null || end === null || end < start) return null;

    const nodes = collectTextNodes(element);
    const startPoint = offsetToNode(nodes, start);
    const endPoint = offsetToNode(nodes, end);
    const doc = element.ownerDocument || (typeof document !== "undefined" ? document : null);
    if (!startPoint || !endPoint || !doc?.createRange) return null;

    const range = doc.createRange();
    range.setStart(startPoint.node, startPoint.offset);
    range.setEnd(endPoint.node, endPoint.offset);
    return range;
}

/**
 * Converts token offsets into a character range using whitespace tokenization.
 * @param {Element} element Text-bearing element.
 * @param {number} tokenStart Inclusive token start.
 * @param {number} tokenEnd Exclusive token end.
 * @returns {Range|null} Browser range or null.
 */
export function createTokenRange(element, tokenStart, tokenEnd) {
    const start = numberOrNull(tokenStart);
    const end = numberOrNull(tokenEnd);
    if (!element || start === null || end === null || end < start) return null;

    const text = element.textContent || "";
    const matches = Array.from(text.matchAll(/\S+/g));
    if (!matches[start]) return null;
    const first = matches[start].index;
    const lastMatch = matches[Math.max(start, end - 1)];
    if (!lastMatch) return null;
    return createCharacterRange(element, first, lastMatch.index + lastMatch[0].length);
}
