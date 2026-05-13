
// B"H
/**
 * @file drag.js
 * @description
 * Pointer-based drag for desktop and mobile.
 */

import { DesktopState } from '../DesktopState.js';
import { clampWindow, setWindowVars } from './geometry.js';
import { log } from '../../diagnostics/VirtualOSLog.js';

/**
 * @function bindWindowDrag
 * @param {HTMLElement} el Window element.
 * @param {object} win Window state.
 * @param {object} state Desktop state.
 * @param {HTMLElement} root Root node.
 * @returns {void}
 */
export function bindWindowDrag(el, win, state, root) {
    const handle = el.querySelector('[data-drag-handle="true"]');
    if (!handle) return;

    handle.addEventListener('pointerdown', (event) => {
        if (event.target.closest('.virtual-window-controls')) return;
        if (win.isMaximized) return;

        event.preventDefault();
        handle.setPointerCapture?.(event.pointerId);

        DesktopState.focusWindow(state, win.id);
        state.focusedWindowId = win.id;

        const startX = event.clientX;
        const startY = event.clientY;
        const baseX = Number(win.x) || 0;
        const baseY = Number(win.y) || 0;

        log('Drag start', { windowId: win.id, baseX, baseY });

        const move = (moveEvent) => {
            win.x = baseX + moveEvent.clientX - startX;
            win.y = baseY + moveEvent.clientY - startY;
            clampWindow(win, root);
            setWindowVars(el, win);
        };

        const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            DesktopState.save(state);
            log('Drag end', { windowId: win.id, x: win.x, y: win.y });
        };

        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
    });

    handle.addEventListener('dblclick', () => {
        win.isMaximized = !win.isMaximized;
        DesktopState.save(state);
        el.classList.toggle('maximized', win.isMaximized);
    });
}
