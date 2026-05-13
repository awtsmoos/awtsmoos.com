
// B"H
/**
 * @file windowMount.js
 * @description
 * Mounts one window through JSON blueprint plus geometry CSS variables.
 */

import { HTML } from '../../../html-generator.js';
import { windowBlueprint } from '../blueprints/windowBlueprint.js';

/**
 * @function applyWindowGeometry
 * @param {HTMLElement} el Window element.
 * @param {object} win Window state.
 * @returns {void}
 */
function applyWindowGeometry(el, win) {
    el.style.setProperty('--vos-window-x', `${Math.max(0, Number(win.x) || 24)}px`);
    el.style.setProperty('--vos-window-y', `${Math.max(0, Number(win.y) || 24)}px`);
    el.style.setProperty('--vos-window-width', `${Math.max(280, Number(win.width) || 640)}px`);
    el.style.setProperty('--vos-window-height', `${Math.max(180, Number(win.height) || 380)}px`);
    el.style.setProperty('--vos-window-z', String(Number(win.zIndex) || 20));
}

/**
 * @function mountWindow
 * @param {object} win Window state.
 * @returns {HTMLElement} Window node.
 */
export function mountWindow(win) {
    const el = HTML(windowBlueprint(win));
    applyWindowGeometry(el, win);
    return el;
}
