
// B"H
/**
 * @file VirtualOSBoot.js
 * @description
 * Guarantees visible starter windows before the desktop is painted.
 *
 * If all windows are minimized, missing, or invalid, the OS can seem like
 * black nothing. This boot guard opens the first Explorer and Terminal
 * before rendering, so the world is born with vessels already visible.
 */

/**
 * @function hasVisibleWindow
 * @param {object} desktopState Desktop state.
 * @returns {boolean} True if at least one window should be visible.
 */
export function hasVisibleWindow(desktopState) {
    return Array.isArray(desktopState?.windows) &&
        desktopState.windows.some((win) => win && !win.isMinimized && win.appId);
}

/**
 * @function ensureStarterWindows
 * @param {object} desktopState Desktop state.
 * @param {Function} launch Launcher function.
 * @returns {boolean} True if windows were created.
 */
export function ensureStarterWindows(desktopState, launch) {
    if (!desktopState) return false;

    desktopState.windows = Array.isArray(desktopState.windows) ? desktopState.windows : [];
    desktopState.processes = Array.isArray(desktopState.processes) ? desktopState.processes : [];

    if (hasVisibleWindow(desktopState)) return false;

    desktopState.windows = [];
    desktopState.processes = [];

    launch(desktopState, 'explorer');
    launch(desktopState, 'terminal');

    return true;
}
