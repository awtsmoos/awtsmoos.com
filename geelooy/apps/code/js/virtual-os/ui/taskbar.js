
// B"H
/**
 * @file taskbar.js
 * @description
 * JSON-generated taskbar.
 */

import { HTML } from '../../html-generator.js';
import { DesktopState } from '../core/DesktopState.js';
import { log } from '../diagnostics/VirtualOSLog.js';

/**
 * @function renderTaskbar
 * @param {HTMLElement} host Task host.
 * @param {object} state Desktop state.
 * @param {Function} requestRender Render callback.
 * @returns {void}
 */
export function renderTaskbar(host, state, requestRender) {
    host.replaceChildren();

    log('Taskbar render', { windows: state.windows.length });

    for (const win of state.windows) {
        host.appendChild(HTML({
            tag: 'button',
            className: 'virtual-os-task',
            text: win.title || win.appId,
            events: {
                click() {
                    win.isMinimized = false;
                    DesktopState.focusWindow(state, win.id);
                    requestRender();
                }
            }
        }));
    }
}
