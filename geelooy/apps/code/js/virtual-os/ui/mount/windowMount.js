
// B"H
/**
 * @file windowMount.js
 * @description
 * Mounts one window through JSON blueprint plus CSS variables.
 */

import { HTML } from '../../../html-generator.js';
import { windowBlueprint } from '../blueprints/windowBlueprint.js';

export function applyWindowGeometry(el, win) {
    el.style.setProperty('--vos-window-x', `${Math.max(0, Number(win.x) || 24)}px`);
    el.style.setProperty('--vos-window-y', `${Math.max(0, Number(win.y) || 24)}px`);
    el.style.setProperty('--vos-window-width', `${Math.max(280, Number(win.width) || 640)}px`);
    el.style.setProperty('--vos-window-height', `${Math.max(180, Number(win.height) || 380)}px`);
    el.style.setProperty('--vos-window-z', String(Number(win.zIndex) || 20));
}

export function mountWindow(win, focusedId) {
    const el = HTML(windowBlueprint(win, focusedId));
    applyWindowGeometry(el, win);
    return el;
}
