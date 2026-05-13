
// B"H
/**
 * @file FileExplorerApp.js
 * @description
 * File Explorer is now the real editor FileCommander hosted in a window.
 */

import { H } from '../ui/h.js';
import { makeCommanderLikeTab } from './file-commander/FileCommanderWindowHost.js';

/**
 * @function renderFileExplorerApp
 * @param {object} windowState Window state.
 * @param {HTMLElement} container Mount.
 * @param {object} desktopState Desktop state.
 * @param {object} env Environment.
 * @returns {Promise<void>}
 */
export async function renderFileExplorerApp(windowState, container, desktopState, env) {
    const host = H({ tag: 'div', className: 'vos-file-commander-host' });
    container.replaceChildren(host);

    try {
        const { FileCommander } = await import('../../file-commander/index.js');
        const tabLike = makeCommanderLikeTab(windowState, env);
        FileCommander.render(tabLike, host);
        windowState.payload.commanderState = tabLike.commanderState;
    } catch (error) {
        host.replaceChildren(H({
            tag: 'div',
            className: 'vos-app-error',
            children: [
                { tag: 'div', className: 'vos-app-error-title', text: 'File Commander failed to mount.' },
                { tag: 'pre', className: 'vos-app-error-stack', text: error?.stack || error?.message || String(error) }
            ]
        }));
    }
}
