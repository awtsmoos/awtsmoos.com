
// B"H
/**
 * @file desktopIcons.js
 * @description
 * Renders clickable desktop app icons.
 */

import { HTML } from '../../html-generator.js';
import { AppRegistry } from '../apps/AppRegistry.js';
import { desktopIconBlueprint } from './blueprints/desktopIconBlueprint.js';
import { launchVirtualWindow } from '../core/desktopBoot.js';
import { log } from '../diagnostics/VirtualOSLog.js';

export function renderDesktopIcons(host, state, requestRender) {
    host.replaceChildren();

    for (const app of Object.values(AppRegistry)) {
        const icon = HTML(desktopIconBlueprint(app));

        icon.addEventListener('dblclick', () => {
            log('Desktop icon double click', { appId: app.id });
            launchVirtualWindow(state, app.id, {
                x: 76 + state.windows.length * 22,
                y: 54 + state.windows.length * 18
            });
            requestRender();
        });

        icon.addEventListener('click', () => {
            icon.focus();
        });

        host.appendChild(icon);
    }

    log('Desktop icons rendered', { count: Object.keys(AppRegistry).length });
}
