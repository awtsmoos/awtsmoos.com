
// B"H
/**
 * @file windowLayer.js
 * @description
 * Renders the complete window layer.
 */

import { mountWindow } from '../ui/mount/windowMount.js';
import { renderAppSafely } from './appRenderer.js';
import { bindWindowControls } from './windowBinder.js';
import { log, warn } from '../diagnostics/VirtualOSLog.js';

/**
 * @function renderWindowLayer
 * @param {HTMLElement} layer Window layer.
 * @param {object} state Desktop state.
 * @param {object} env Environment.
 * @returns {void}
 */
export function renderWindowLayer(layer, state, env) {
    layer.replaceChildren();

    const visible = state.windows
        .filter((win) => !win.isMinimized)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    log('Window layer render', {
        totalWindows: state.windows.length,
        visibleWindows: visible.length
    });

    if (!visible.length) {
        warn('No visible windows during layer render', { state });
    }

    for (const win of visible) {
        const el = mountWindow(win);
        const mount = el.querySelector('.virtual-window-content');

        bindWindowControls(el, win, state, env);
        renderAppSafely(win, mount, state, env);

        layer.appendChild(el);
    }
}
