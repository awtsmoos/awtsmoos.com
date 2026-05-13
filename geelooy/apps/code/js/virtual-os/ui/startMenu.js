
// B"H
/**
 * @file startMenu.js
 * @description
 * JSON-generated start menu.
 */

import { HTML } from '../../html-generator.js';
import { AppRegistry } from '../apps/AppRegistry.js';
import { launchVirtualWindow } from '../core/desktopBoot.js';

/**
 * @function renderStartMenu
 * @param {HTMLElement} menu Start menu host.
 * @param {object} state Desktop state.
 * @param {Function} requestRender Render callback.
 * @returns {void}
 */
export function renderStartMenu(menu, state, requestRender) {
    menu.replaceChildren();

    for (const app of Object.values(AppRegistry)) {
        menu.appendChild(HTML({
            tag: 'button',
            className: 'virtual-os-start-menu-item',
            text: app.title,
            dataset: { appId: app.id },
            events: {
                click() {
                    launchVirtualWindow(state, app.id, {
                        x: 70 + state.windows.length * 18,
                        y: 52 + state.windows.length * 14
                    });

                    state.startMenuOpen = false;
                    requestRender();
                }
            }
        }));
    }

    menu.classList.toggle('hidden', !state.startMenuOpen);
}
