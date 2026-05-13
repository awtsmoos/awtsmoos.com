
// B"H
/**
 * @file desktopBoot.js
 * @description
 * Ensures starter windows are physically present and visible.
 */

import { AppRegistry } from '../apps/AppRegistry.js';
import { DesktopState } from './DesktopState.js';
import { log, warn } from '../diagnostics/VirtualOSLog.js';

/**
 * @function launchVirtualWindow
 * @param {object} state Desktop state.
 * @param {string} appId Registered app id.
 * @param {object} geometry Geometry hints.
 * @returns {object|null} Created window.
 */
export function launchVirtualWindow(state, appId, geometry = {}) {
    const app = AppRegistry[appId];

    if (!app) {
        warn('Missing app during launch', { appId });
        return null;
    }

    const proc = DesktopState.launchProcess(state, app.id, app.title);

    const win = DesktopState.addWindow(state, {
        id: proc.windowId,
        processId: proc.id,
        appId: app.id,
        title: app.title,
        width: geometry.width || app.width || 640,
        height: geometry.height || app.height || 420,
        x: geometry.x ?? 64,
        y: geometry.y ?? 42,
        isMinimized: false
    });

    log('Window launched', { appId, windowId: win.id });
    return win;
}

/**
 * @function ensureStarterWindows
 * @param {object} state Desktop state.
 * @returns {void}
 */
export function ensureStarterWindows(state) {
    state.windows = Array.isArray(state.windows) ? state.windows : [];
    state.processes = Array.isArray(state.processes) ? state.processes : [];

    state.windows = state.windows.filter((win) => win && win.id && AppRegistry[win.appId]);

    const visible = state.windows.some((win) => !win.isMinimized);

    log('Starter window check', {
        total: state.windows.length,
        visible
    });

    if (visible) return;

    state.windows = [];
    state.processes = [];

    launchVirtualWindow(state, 'explorer', { x: 34, y: 28, width: 540, height: 350 });
    launchVirtualWindow(state, 'terminal', { x: 92, y: 78, width: 640, height: 320 });
}
