
// B"H
/**
 * @file windowMount.js
 * @description
 * Mounts one window through JSON blueprint plus CSS variables.
 */

import { H } from '../h.js';
import { windowBlueprint } from '../blueprints/windowBlueprint.js';

/**
 * @function applyWindowGeometry
 * @param {HTMLElement} el Window element.
 * @param {object} win Window state.
 * @returns {void}
 */
export function applyWindowGeometry(el, win) {
    el.style.setProperty('--vos-window-x', `${Math.max(0, Number(win.x) || 24)}px`);
    el.style.setProperty('--vos-window-y', `${Math.max(0, Number(win.y) || 24)}px`);
    el.style.setProperty('--vos-window-width', `${Math.max(280, Number(win.width) || 640)}px`);
    el.style.setProperty('--vos-window-height', `${Math.max(180, Number(win.height) || 380)}px`);
    el.style.setProperty('--vos-window-z', String(Number(win.zIndex) || 20));
}

/**
 * @function mountWindow
 * @param {object} win Window state.
 * @param {string} focusedId Focused window id.
 * @returns {HTMLElement} Window node.
 */
export function mountWindow(win, focusedId) {
    const el = H(windowBlueprint(win, focusedId));
    applyWindowGeometry(el, win);
    return el;
}
