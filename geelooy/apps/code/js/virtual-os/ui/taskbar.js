
// B"H
/**
 * @file taskbar.js
 * @description
 * JSON-generated taskbar with correct minimize/restore behavior.
 */

import { HTML } from '../../html-generator.js';
import { DesktopState } from '../core/DesktopState.js';
import { log } from '../diagnostics/VirtualOSLog.js';

export function renderTaskbar(host, state, requestRender) {
    host.replaceChildren();

    log('Taskbar render', {
        windows: state.windows.length,
        focusedWindowId: state.focusedWindowId
    });

    for (const win of state.windows) {
        const active = String(win.id) === String(state.focusedWindowId);

        const button = HTML({
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
