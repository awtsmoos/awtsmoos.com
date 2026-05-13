
// B"H
/**
 * @file appRenderer.js
 * @description
 * Safe app renderer. Async crashes become visible window content.
 */

import { HTML } from '../../html-generator.js';
import { AppRegistry } from '../apps/AppRegistry.js';
import { error, log, warn } from '../diagnostics/VirtualOSLog.js';

/**
 * @function paintAppError
 * @param {HTMLElement} mount Window content mount.
 * @param {string} title Error title.
 * @param {unknown} thrown Error.
 * @returns {void}
 */
export function paintAppError(mount, title, thrown) {
    mount.replaceChildren(HTML({
        tag: 'div',
        style: {
            padding: '14px',
            color: '#ffb0b0',
            background: '#18070a',
            fontFamily: 'var(--font-code, monospace)',
            whiteSpace: 'pre-wrap'
        },
        children: [
            { tag: 'strong', text: title },
            { tag: 'pre', text: thrown?.stack || thrown?.message || String(thrown) }
        ]
    }));
}

/**
 * @function renderAppSafely
 * @param {object} win Window state.
 * @param {HTMLElement} mount Window content mount.
 * @param {object} desktopState Desktop state.
 * @param {object} env Runtime env.
 * @returns {void}
 */
export function renderAppSafely(win, mount, desktopState, env) {
    const app = AppRegistry[win.appId];

    if (!app?.renderer) {
        warn('Missing app renderer', { appId: win.appId });
        paintAppError(mount, 'Missing Virtual OS app renderer', `App id: ${win.appId}`);
        return;
    }

    log('Rendering app', { appId: win.appId, windowId: win.id });

    try {
        Promise.resolve(app.renderer(win, mount, desktopState, env)).catch((thrown) => {
            error('Async app render failed', thrown, { appId: win.appId });
            paintAppError(mount, `App crashed async: ${win.appId}`, thrown);
        });
    } catch (thrown) {
        error('Sync app render failed', thrown, { appId: win.appId });
        paintAppError(mount, `App crashed sync: ${win.appId}`, thrown);
    }
}
