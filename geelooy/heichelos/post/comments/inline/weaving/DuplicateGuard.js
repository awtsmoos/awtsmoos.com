/**
 * B"H
 * @module DuplicateGuard
 * @description
 * Chapter 9: The Awtsmoos appoints one watchman for the whole page. A comment
 * ID and alias may enter reality once; no shelter-local blindness can multiply
 * the same spark across paragraphs again.
 */

function escapeForAttr(value) {
    const str = String(value);
    if (globalThis.CSS && typeof globalThis.CSS.escape === "function") return globalThis.CSS.escape(str);
    return str.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

/**
 * Builds the document-wide duplicate selector.
 * @param {string|number} commentId Comment ID.
 * @param {string} alias Alias ID.
 * @returns {string} Selector for an already-rendered inline card.
 */
export function inlineDuplicateSelector(commentId, alias) {
    return `[data-cid="${escapeForAttr(commentId)}"][data-from-alias="${escapeForAttr(alias)}"]`;
}

/**
 * Checks the whole document, not the local shelter, for an existing card.
 * @param {Document|Element} root Document-like root.
 * @param {string|number} commentId Comment ID.
 * @param {string} alias Alias ID.
 * @returns {boolean} True when this alias/comment pair is already on page.
 */
export function inlineDuplicateExists(root, commentId, alias) {
    if (!root || typeof root.querySelector !== "function") return false;
    return Boolean(root.querySelector(inlineDuplicateSelector(commentId, alias)));
}
