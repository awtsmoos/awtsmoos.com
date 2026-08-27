
// B"H
/**
 * @file BrowserApp.js
 * @description
 * Virtual OS browser window powered by the shared real BrowserRuntime.
 */

import { BrowserRuntime } from '../../browser/runtime/BrowserRuntime.js';

/**
 * @function renderBrowserApp
 * @param {object} windowState Window state.
 * @param {HTMLElement} container Mount.
 * @param {object} desktopState Desktop state.
 * @param {object} env Environment.
 * @returns {void}
 */
export function renderBrowserApp(windowState, container, desktopState, env) {
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.currentUrl = payload.currentUrl || payload.url || 'about:blank';
    payload.history = Array.isArray(payload.history) ? payload.history : [];
    payload.consoleVisible = Boolean(payload.consoleVisible);

    windowState.payload = payload;

    const runtime = new BrowserRuntime({
        id: `virtual-browser-${windowState.id}`,
        container,
        state: payload,
        save() {
            env.requestRender();
        }
    });

    runtime.mount();
}
