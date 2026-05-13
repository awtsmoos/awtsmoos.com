
// B"H
/**
 * @file windowLayer.js
 * @description
 * Renders the complete window layer.
 */

import { mountWindow } from '../ui/mount/windowMount.js';
import { renderAppSafely } from './appRenderer.js';
import { bindWindowControls } from './windowBinder.js';
import { log } from '../diagnostics/VirtualOSLog.js';

export function renderWindowLayer(layer, state, env, root) {
    layer.replaceChildren();

    const visible = state.windows
        .filter((win) => !win.isMinimized)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    log('Window layer render', {
        totalWindows: state.windows.length,
        visibleWindows: visible.length,
        focusedWindowId: state.focusedWindowId
    });

    for (const win of visible) {
        const el = mountWindow(win, state.focusedWindowId);
        const mount = el.querySelector('.virtual-window-content');

        bindWindowControls(el, win, state, env, root);
        renderAppSafely(win, mount, state, env);

        layer.appendChild(el);
    }
}
