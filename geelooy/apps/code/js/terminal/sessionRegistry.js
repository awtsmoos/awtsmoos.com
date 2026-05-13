
// B"H
/**
 * @file sessionRegistry.js
 * @description
 * Memory-vault for living terminal shells.
 *
 * Tabs may close, awaken, sleep, and return. This registry remembers only
 * the active shell instances, so closing a tab can clean its living vessel
 * without destroying the saved textual history inside the tab state.
 */

const sessions = new Map();

/**
 * @function rememberTerminalSession
 * @param {number|string} tabId Terminal tab id.
 * @param {object} shell Live TerminalShell instance.
 * @returns {void}
 */
export function rememberTerminalSession(tabId, shell) {
    sessions.set(String(tabId), shell);
}

/**
 * @function forgetTerminalSession
 * @param {number|string} tabId Terminal tab id.
 * @returns {void}
 */
export function forgetTerminalSession(tabId) {
    const key = String(tabId);
    const shell = sessions.get(key);

    if (shell?.destroy) shell.destroy();

    sessions.delete(key);
}

/**
 * @function getTerminalSession
 * @param {number|string} tabId Terminal tab id.
 * @returns {object|null} Live shell or null.
 */
export function getTerminalSession(tabId) {
    return sessions.get(String(tabId)) || null;
}
