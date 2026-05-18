
// B"H
/**
 * @file windowBinder.js
 * @description
 * Binds controls, focus, dragging, and resizing.
 */

import { DesktopState } from './DesktopState.js';
import { bindWindowDrag } from './windowMotion/drag.js';
import { bindWindowResize } from './windowMotion/resize.js';
import { log } from '../diagnostics/VirtualOSLog.js';

/**
 * @function bindWindowControls
 * @param {HTMLElement} el Window element.
 * @param {object} win Window state.
 * @param {object} state Desktop state.
 * @param {object} env Render environment.
 * @param {HTMLElement} root Root node.
 * @returns {void}
 */
export function bindWindowControls(el, win, state, env, root) {
    el.addEventListener('pointerdown', () => {
        DesktopState.focusWindow(state, win.id);
        state.focusedWindowId = win.id;
        DesktopState.save(state);
    });

    el.querySelector('.virtual-window-controls')?.addEventListener('click', (event) => {
        const action = event.target?.dataset?.action;
        if (!action) return;

        event.stopPropagation();

        log('Window control', { action, windowId: win.id });

        if (action === 'close') DesktopState.closeWindow(state, win.id);

        if (action === 'minimize') {
            win.isMinimized = true;
            const top = [...state.windows].filter((entry) => !entry.isMinimized && entry.id !== win.id)
                .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))[0];
            state.focusedWindowId = top?.id || null;
        }

        if (action === 'maximize') {
            win.isMaximized = !win.isMaximized;
        }

        env.requestRender();
    });

    bindWindowDrag(el, win, state, root);
    bindWindowResize(el, win, state, root);
}
