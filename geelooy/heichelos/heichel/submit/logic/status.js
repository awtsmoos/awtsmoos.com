// B"H
/**
 * @module SubmitStatus
 * @description
 * A small lamp for the launch console: status belongs near the work, so the
 * composer can answer without throwing the traveler into alert-only darkness.
 */

/**
 * Writes a calm status message when the template provides a status region.
 * @param {string} message message to reveal
 * @param {"info"|"error"|"success"} tone visual tone for future CSS hooks
 */
export function setSubmitStatus(message, tone = "info") {
    const node = document.getElementById("submitStatusMessage");
    if (!node) return;
    node.textContent = message || "";
    node.dataset.tone = tone;
}

/**
 * Marks required boot nodes that should exist on every submit surface.
 * @param {string[]} ids required DOM ids
 * @returns {string[]} missing ids
 */
export function missingSubmitNodes(ids) {
    return ids.filter(id => !document.getElementById(id));
}
