
// B"H
/**
 * @file geometry.js
 * @description
 * Window coordinate helpers.
 */

export function clampWindow(win, root) {
    const rect = root.getBoundingClientRect();
    const width = Math.max(240, Number(win.width) || 500);
    const height = Math.max(160, Number(win.height) || 300);

    win.width = width;
    win.height = height;
    win.x = Math.max(0, Math.min(Number(win.x) || 0, Math.max(0, rect.width - 80)));
    win.y = Math.max(0, Math.min(Number(win.y) || 0, Math.max(0, rect.height - 90)));

    return win;
}

export function setWindowVars(el, win) {
    el.style.setProperty('--vos-window-x', `${Math.round(win.x)}px`);
    el.style.setProperty('--vos-window-y', `${Math.round(win.y)}px`);
    el.style.setProperty('--vos-window-width', `${Math.round(win.width)}px`);
    el.style.setProperty('--vos-window-height', `${Math.round(win.height)}px`);
    el.style.setProperty('--vos-window-z', String(win.zIndex || 1));
}
