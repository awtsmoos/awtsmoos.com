
// B"H
/**
 * @file windowBinder.js
 * @description
 * Binds focus and controls to a manifested window.
 */

import { DesktopState } from './DesktopState.js';

/**
 * @function bindWindowControls
 * @param {HTMLElement} el Window element.
 * @param {object} win Window state.
 * @param {object} state Desktop state.
 * @param {object} env Render environment.
 * @returns {void}
 */
export function bindWindowControls(el, win, state, env) {
    el.addEventListener('pointerdown', () => {
        DesktopState.focusWindow(state, win.id);
        DesktopState.save(state);
    });

    el.querySelector('.virtual-window-controls')?.addEventListener('click', (event) => {
        const action = event.target?.dataset?.action;
        if (!action) return;

        if (action === 'close') DesktopState.closeWindow(state, win.id);
        if (action === 'minimize') win.isMinimized = true;
        if (action === 'front') DesktopState.focusWindow(state, win.id);

        env.requestRender();
    });
}
