
// B"H
/**
 * @file resize.js
 * @description
 * Pointer-based window resizing.
 */

import { DesktopState } from '../DesktopState.js';
import { setWindowVars } from './geometry.js';
import { log } from '../../diagnostics/VirtualOSLog.js';

/**
 * @function bindWindowResize
 * @param {HTMLElement} el Window element.
 * @param {object} win Window state.
 * @param {object} state Desktop state.
 * @returns {void}
 */
export function bindWindowResize(el, win, state) {
    const handle = el.querySelector('[data-resize-handle="true"]');
    if (!handle) return;

    handle.addEventListener('pointerdown', (event) => {
        if (win.isMaximized) return;

        event.preventDefault();
        handle.setPointerCapture?.(event.pointerId);

        const startX = event.clientX;
        const startY = event.clientY;
        const baseW = Number(win.width) || 500;
        const baseH = Number(win.height) || 300;

        log('Resize start', { windowId: win.id, baseW, baseH });

        const move = (moveEvent) => {
            win.width = Math.max(Number(win.minWidth) || 280, baseW + moveEvent.clientX - startX);
            win.height = Math.max(Number(win.minHeight) || 180, baseH + moveEvent.clientY - startY);
            setWindowVars(el, win);
        };

        const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            DesktopState.save(state);
            log('Resize end', { windowId: win.id, width: win.width, height: win.height });
        };

        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
    });
}
