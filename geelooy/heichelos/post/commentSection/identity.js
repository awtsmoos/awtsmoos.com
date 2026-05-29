// B"H
/**
 * @module CommentIdentity
 * @description
 * Chapter 5: Before a comment receives a body, its speaker must be known. This
 * tiny keeper resolves the active alias from window and local storage.
 */

/**
 * Resolves and persists the active alias used for comment transmission.
 * @returns {string} Active alias id or an empty string.
 */
export function getActiveAlias() {
    const alias = window.curAlias
        || localStorage.getItem("lastAliasUsed")
        || localStorage.getItem("awtsmoos-alias")
        || "";
    if (alias) window.curAlias = alias;
    return alias;
}
