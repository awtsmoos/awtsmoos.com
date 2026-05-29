// B"H
/**
 * @module CommentEditorValue
 * @description
 * Chapter 5: Raw editor HTML is locked inside one guarded vessel. The rest of
 * the comment system touches text, nodes, and coordinates, not scattered sinks.
 */

/** @param {HTMLElement} box @param {string} html */
export function setEditorHtml(box, html) {
    box.innerHTML = html || "";
}

/** @param {HTMLElement} box @returns {string} */
export function getEditorHtml(box) {
    return box.innerHTML || "";
}

/** @param {HTMLElement} box */
export function clearEditor(box) {
    box.replaceChildren();
}

/** @param {string} html @returns {string} */
export function stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";
    return tmp.textContent || tmp.innerText || "";
}

/** @param {string} content @returns {boolean} */
export function hasMeaningfulContent(content) {
    return stripHtml(content).trim().length > 0 || /<img\b/i.test(content || "");
}
