
// B"H
/**
 * @file taskbar.js
 * @description
 * JSON-generated taskbar with correct minimize and restore behavior.
 */

import { H } from './h.js';
import { DesktopState } from '../core/DesktopState.js';
import { always } from '../diagnostics/VirtualOSLog.js';

/**
 * @function renderTaskbar
 * @param {HTMLElement} host Task host.
 * @param {object} state Desktop state.
 * @param {Function} requestRender Render callback.
 * @returns {void}
 */
export function renderTaskbar(host, state, requestRender) {
    host.replaceChildren();

    always('Taskbar render', {
        windows: state.windows.length,
        focusedWindowId: state.focusedWindowId
    });

    for (const win of state.windows) {
        const active = String(win.id) === String(state.focusedWindowId);

        const button = H({
            tag: 'button',
            className: `virtual-os-task${active ? ' is-active' : ''}`,
            text: win.title || win.appId,
            attrs: { type: 'button', title: win.title || win.appId }
        });

        button.addEventListener('click', () => {
            if (active && !win.isMinimized) {
                win.isMinimized = true;
            } else {
                win.isMinimized = false;
                DesktopState.focusWindow(state, win.id);
                state.focusedWindowId = win.id;
            }

            requestRender();
        });

        host.appendChild(button);
    }
}
