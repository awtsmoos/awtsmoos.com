
// B"H
/**
 * @file appRenderer.js
 * @description
 * Safe renderer for all Virtual OS apps.
 */

import { AppRegistry } from '../apps/AppRegistry.js';
import { mountAppError } from '../ui/mount/errorMount.js';
import { error, log, warn } from '../diagnostics/VirtualOSLog.js';

/**
 * @function renderAppSafely
 * @param {object} win Window state.
 * @param {HTMLElement} mount App mount node.
 * @param {object} state Desktop state.
 * @param {object} env App environment.
 * @returns {void}
 */
export function renderAppSafely(win, mount, state, env) {
    const app = AppRegistry[win.appId];

    if (!app?.renderer) {
        warn('Missing app renderer', { appId: win.appId, windowId: win.id });
        mountAppError(mount, 'Missing app renderer', `App id: ${win.appId}`);
        return;
    }

    log('App render begin', { appId: win.appId, windowId: win.id });

    try {
        Promise.resolve(app.renderer(win, mount, state, env)).then(() => {
            log('App render settled', {
                appId: win.appId,
                windowId: win.id,
                childCount: mount.childElementCount
            });
        }).catch((thrown) => {
            error('Async app render failed', thrown, { appId: win.appId, windowId: win.id });
            mountAppError(mount, `Async app crash: ${win.appId}`, thrown);
        });
    } catch (thrown) {
        error('Sync app render failed', thrown, { appId: win.appId, windowId: win.id });
        mountAppError(mount, `Sync app crash: ${win.appId}`, thrown);
    }
}
