// B"H
/**
 * @file resize.js
 * @description Edge-aware pointer resizing for desktop and mobile.
 *
 * The Awtsmoos lets every border become a living threshold: east widens,
 * south deepens, west pulls the vessel backward, and north lifts it upward.
 * Mouse, pen, and touch all enter through one pointer covenant.
 */

import { DesktopState } from '../DesktopState.js';
import { clampWindow, setWindowVars } from './geometry.js';
import { log } from '../../diagnostics/VirtualOSLog.js';

const EDGE = 10;
const CURSORS = {
    n: 'ns-resize',
    s: 'ns-resize',
    e: 'ew-resize',
    w: 'ew-resize',
    ne: 'nesw-resize',
    sw: 'nesw-resize',
    nw: 'nwse-resize',
    se: 'nwse-resize'
};

function directionFromPoint(el, event) {
    const rect = el.getBoundingClientRect();
    const left = event.clientX - rect.left <= EDGE;
    const right = rect.right - event.clientX <= EDGE;
    const top = event.clientY - rect.top <= EDGE;
    const bottom = rect.bottom - event.clientY <= EDGE;
    return `${top ? 'n' : bottom ? 's' : ''}${left ? 'w' : right ? 'e' : ''}` || '';
}

function applyResize(win, base, dx, dy, dir) {
    const minW = Number(win.minWidth) || 280;
    const minH = Number(win.minHeight) || 180;

    if (dir.includes('e')) win.width = Math.max(minW, base.width + dx);
    if (dir.includes('s')) win.height = Math.max(minH, base.height + dy);

    if (dir.includes('w')) {
        const wanted = Math.max(minW, base.width - dx);
        win.x = base.x + (base.width - wanted);
        win.width = wanted;
    }

    if (dir.includes('n')) {
        const wanted = Math.max(minH, base.height - dy);
        win.y = base.y + (base.height - wanted);
        win.height = wanted;
    }
}

function beginResize(el, win, state, root, event, dir) {
    if (!dir || win.isMaximized) return;
    event.preventDefault();
    event.stopPropagation();
    el.setPointerCapture?.(event.pointerId);

    const base = {
        x: Number(win.x) || 0,
        y: Number(win.y) || 0,
        width: Number(win.width) || 500,
        height: Number(win.height) || 300,
        startX: event.clientX,
        startY: event.clientY
    };

    log('Resize start', { windowId: win.id, dir, width: base.width, height: base.height });

    const move = (moveEvent) => {
        applyResize(win, base, moveEvent.clientX - base.startX, moveEvent.clientY - base.startY, dir);
        if (root) clampWindow(win, root);
        setWindowVars(el, win);
    };

    const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        DesktopState.save(state);
        log('Resize end', { windowId: win.id, width: win.width, height: win.height });
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
}

/**
 * @function bindWindowResize
 * @param {HTMLElement} el Window element.
 * @param {object} win Window state.
 * @param {object} state Desktop state.
 * @param {HTMLElement|null} root Virtual OS root.
 * @returns {void}
 */
export function bindWindowResize(el, win, state, root = null) {
    const corner = el.querySelector('[data-resize-handle="true"]');
 
    el.addEventListener('pointermove', (event) => {
        if (win.isMaximized) return;
        const dir = directionFromPoint(el, event);
        el.dataset.resizeDirection = dir;
        el.style.cursor = CURSORS[dir] || '';
    });

    el.addEventListener('pointerleave', () => {
        el.dataset.resizeDirection = '';
        el.style.cursor = '';
    });

    el.addEventListener('pointerdown', (event) => {
        if (event.target.closest('.virtual-window-titlebar, .virtual-window-content')) return;
        beginResize(el, win, state, root, event, directionFromPoint(el, event));
    });

    corner?.addEventListener('pointerdown', (event) => beginResize(el, win, state, root, event, 'se'));
}
