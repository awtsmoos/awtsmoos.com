
// B"H
/**
 * @file desktopIcons.js
 * @description
 * Renders draggable clickable desktop app icons.
 */

import { H } from './h.js';
import { AppRegistry } from '../apps/AppRegistry.js';
import { desktopIconBlueprint } from './blueprints/desktopIconBlueprint.js';
import { launchVirtualWindow } from '../core/desktopBoot.js';
import { ensureIconPositions } from '../desktop/icons/IconGridLayout.js';
import { bindIconDrag } from '../desktop/icons/IconDragController.js';
import { always } from '../diagnostics/VirtualOSLog.js';

/**
 * @function renderDesktopIcons
 * @param {HTMLElement} host Desktop host.
 * @param {object} state Desktop state.
 * @param {Function} requestRender Render callback.
 * @returns {void}
 */
export function renderDesktopIcons(host, state, requestRender) {
    host.replaceChildren();

    const apps = Object.values(AppRegistry);
    ensureIconPositions(state, apps);

    for (const app of apps) {
        const icon = H(desktopIconBlueprint(app, state.selectedIconId === app.id));

        bindIconDrag(icon, app, state);

        icon.addEventListener('click', () => {
            state.selectedIconId = app.id;
            requestRender();
        });

        icon.addEventListener('dblclick', () => {
            if (icon.dataset.dragMoved === 'true') return;

            launchVirtualWindow(state, app.id, {
                x: 76 + state.windows.length * 22,
                y: 54 + state.windows.length * 18
            });

            requestRender();
        });

        host.appendChild(icon);
    }

    always('Desktop icons rendered', { count: apps.length });
}
