
// B"H
/**
 * @file desktopBoot.js
 * @description
 * Opens starter windows only when no valid windows exist.
 */

import { AppRegistry } from '../apps/AppRegistry.js';
import { DesktopState } from './DesktopState.js';
import { log, warn } from '../diagnostics/VirtualOSLog.js';

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

    state.focusedWindowId = win.id;

    log('Window launched', { appId, windowId: win.id });
    return win;
}

export function ensureStarterWindows(state) {
    state.windows = Array.isArray(state.windows) ? state.windows : [];
    state.processes = Array.isArray(state.processes) ? state.processes : [];

    state.windows = state.windows.filter((win) => win && win.id && AppRegistry[win.appId]);

    const liveIds = new Set(state.windows.map((win) => win.id));
    state.processes = state.processes.filter((proc) => proc && liveIds.has(proc.windowId));

    log('Starter window check', {
        total: state.windows.length,
        visible: state.windows.filter((win) => !win.isMinimized).length
    });

    if (state.windows.length > 0) return;

    launchVirtualWindow(state, 'explorer', { x: 34, y: 28, width: 540, height: 350 });
    launchVirtualWindow(state, 'terminal', { x: 92, y: 78, width: 640, height: 320 });
}
