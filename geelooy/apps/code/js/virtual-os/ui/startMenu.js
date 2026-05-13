
// B"H
/**
 * @file startMenu.js
 * @description
 * JSON-generated start menu with rich app entries.
 */

import { H } from './h.js';
import { AppRegistry } from '../apps/AppRegistry.js';
import { launchVirtualWindow } from '../core/desktopBoot.js';

function menuItemBlueprint(app) {
    return {
        tag: 'button',
        className: 'virtual-os-start-menu-item',
        dataset: { appId: app.id },
        attrs: { type: 'button' },
        children: [
            { tag: 'span', className: 'virtual-os-start-menu-icon', text: app.icon || '◈' },
            {
                tag: 'span',
                children: [
                    { tag: 'span', className: 'virtual-os-start-menu-label', text: app.title },
                    { tag: 'span', className: 'virtual-os-start-menu-desc', text: app.description || '' }
                ]
            }
        ]
    };
}

/**
 * @function renderStartMenu
 * @param {HTMLElement} menu Start menu host.
 * @param {object} state Desktop state.
 * @param {Function} requestRender Render callback.
 * @returns {void}
 */
export function renderStartMenu(menu, state, requestRender) {
    menu.replaceChildren(H({
        tag: 'div',
        className: 'virtual-os-start-menu-title',
        text: 'B"H Start'
    }));

    for (const app of Object.values(AppRegistry)) {
        const item = H(menuItemBlueprint(app));

        item.addEventListener('click', () => {
            launchVirtualWindow(state, app.id, {
                x: 70 + state.windows.length * 18,
                y: 52 + state.windows.length * 14
            });

            state.startMenuOpen = false;
            requestRender();
        });

        menu.appendChild(item);
    }

    menu.classList.toggle('hidden', !state.startMenuOpen);
}
