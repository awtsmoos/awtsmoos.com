
// B"H
/**
 * @file desktopBoot.js
 * @description
 * Ensures the desktop is born with visible vessels.
 */

import { AppRegistry } from '../apps/AppRegistry.js';
import { DesktopState } from './DesktopState.js';
import { log, warn } from '../diagnostics/VirtualOSLog.js';

/**
 * @function launchVirtualWindow
 * @param {object} state Desktop state.
 * @param {string} appId Registered app id.
 * @param {object} geometry Geometry overrides.
 * @returns {object|null} Created window.
 */
export function launchVirtualWindow(state, appId, geometry = {}) {
    const app = AppRegistry[appId];
    if (!app) {
        warn('Cannot launch missing app', { appId });
        return null;
    }

    const proc = DesktopState.launchProcess(state, app.id, app.title);

    return DesktopState.addWindow(state, {
        id: proc.windowId,
        processId: proc.id,
        appId: app.id,
        title: app.title,
        width: geometry.width || app.width,
        height: geometry.height || app.height,
        x: geometry.x ?? 64,
        y: geometry.y ?? 42
    });
}

/**
 * @function ensureStarterWindows
 * @param {object} state Desktop state.
 * @returns {void}
 */
export function ensureStarterWindows(state) {
    state.windows = state.windows.filter((win) => win && win.id && AppRegistry[win.appId]);
    const visible = state.windows.some((win) => !win.isMinimized);

    log('Checking starter windows', {
        totalWindows: state.windows.length,
        visible
    });

    if (visible) return;

    state.windows = [];
    state.processes = [];

    launchVirtualWindow(state, 'explorer', { x: 34, y: 28, width: 520, height: 340 });
    launchVirtualWindow(state, 'terminal', { x: 92, y: 78, width: 620, height: 310 });
}
