
// B"H
/**
 * @file VirtualOSBoot.js
 * @description
 * The boot-shofar of the little desktop world.
 * Before any window is drawn, this guard checks whether the universe is
 * empty. If it is empty, the Awtsmoos breathes two starter vessels into
 * being: Explorer and Terminal. No blank black firmament. No silent void.
 */

/**
 * @function ensureStarterWindows
 * @param {object} desktopState The persisted desktop state.
 * @param {Function} launch The app launcher.
 * @returns {boolean} True when boot windows were created.
 */
export function ensureStarterWindows(desktopState, launch) {
    if (!desktopState) return false;

    desktopState.windows = Array.isArray(desktopState.windows) ? desktopState.windows : [];
    desktopState.processes = Array.isArray(desktopState.processes) ? desktopState.processes : [];

    if (desktopState.windows.length > 0) return false;

    launch(desktopState, 'explorer');
    launch(desktopState, 'terminal');

    return true;
}
