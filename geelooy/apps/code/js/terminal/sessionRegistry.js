
// B"H
/**
 * @file sessionRegistry.js
 * @description
 * Memory-vault for living terminal shells.
 */

const sessions = new Map();

export function rememberTerminalSession(tabId, shell) {
    sessions.set(String(tabId), shell);
}

export function forgetTerminalSession(tabId) {
    const key = String(tabId);
    const shell = sessions.get(key);

    if (shell?.destroy) shell.destroy();

    sessions.delete(key);
}

export function getTerminalSession(tabId) {
    return sessions.get(String(tabId)) || null;
}
