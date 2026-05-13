
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
        }

        if (action === 'maximize') {
            win.isMaximized = !win.isMaximized;
            if (win.isMaximized) el.classList.add('maximized');
            else el.classList.remove('maximized');
        }

        if (action !== 'maximize') env.requestRender();
        else DesktopState.save(state);
    });

    bindWindowDrag(el, win, state, root);
    bindWindowResize(el, win, state);
}
