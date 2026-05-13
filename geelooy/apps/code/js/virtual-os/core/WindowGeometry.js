
// B"H
/**
 * @file WindowGeometry.js
 * @description
 * Keeps windows visible inside the Virtual OS firmament.
 */

export function px(value) {
    return `${Math.round(Number(value) || 0)}px`;
}

export function healWindowGeometry(win, rect) {
    win.width = Math.max(Number(win.width) || 760, Number(win.minWidth) || 260);
    win.height = Math.max(Number(win.height) || 420, Number(win.minHeight) || 180);

    const maxX = Math.max(0, (rect?.width || 900) - 80);
    const maxY = Math.max(0, (rect?.height || 600) - 120);

    win.x = Math.max(0, Math.min(Number(win.x) || 24, maxX));
    win.y = Math.max(0, Math.min(Number(win.y) || 24, maxY));

    win.zIndex = Number(win.zIndex) || 1;
    win.minWidth = Number(win.minWidth) || 260;
    win.minHeight = Number(win.minHeight) || 180;

    return win;
}
