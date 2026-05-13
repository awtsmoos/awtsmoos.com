
// B"H
/**
 * @file IconDragController.js
 * @description
 * Pointer drag for desktop icons with persistent memory.
 */

import { DesktopState } from '../../core/DesktopState.js';

/**
 * @function applyIconVars
 * @param {HTMLElement} icon Icon element.
 * @param {object} pos Position.
 * @returns {void}
 */
export function applyIconVars(icon, pos) {
    icon.style.setProperty('--vos-icon-x', `${Math.round(pos.x)}px`);
    icon.style.setProperty('--vos-icon-y', `${Math.round(pos.y)}px`);
}

/**
 * @function bindIconDrag
 * @param {HTMLElement} icon Icon element.
 * @param {object} app App data.
 * @param {object} state Desktop state.
 * @returns {void}
 */
export function bindIconDrag(icon, app, state) {
    const pos = state.icons[app.id] || { x: 18, y: 18 };
    applyIconVars(icon, pos);

    icon.addEventListener('pointerdown', (event) => {
        icon.setPointerCapture?.(event.pointerId);

        state.selectedIconId = app.id;

        const startX = event.clientX;
        const startY = event.clientY;
        const baseX = Number(state.icons[app.id]?.x) || 0;
        const baseY = Number(state.icons[app.id]?.y) || 0;

        let moved = false;

        const move = (moveEvent) => {
            moved = true;
            const next = {
                x: Math.max(0, baseX + moveEvent.clientX - startX),
                y: Math.max(0, baseY + moveEvent.clientY - startY)
            };

            state.icons[app.id] = next;
            applyIconVars(icon, next);
        };

        const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            DesktopState.save(state);
            icon.dataset.dragMoved = moved ? 'true' : 'false';
            setTimeout(() => {
                icon.dataset.dragMoved = 'false';
            }, 0);
        };

        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
    });
}
