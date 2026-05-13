
// B"H
/**
 * @file BrowserApp.js
 * @description
 * Virtual Browser app that can visit real localhost and simulated localhost.
 */

import { H } from '../ui/h.js';
import { browserBlueprint } from './browser/browserBlueprint.js';
import { resolveBrowserAddress } from './browser/urlRouter.js';
import { appendConsoleLine, installBrowserConsoleBridge } from './browser/consoleBridge.js';

/**
 * @function healPayload
 * @param {object} windowState Window state.
 * @returns {object} Payload.
 */
function healPayload(windowState) {
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.url = payload.url || 'about:blank';
    payload.history = Array.isArray(payload.history) ? payload.history : [];
    payload.consoleHidden = Boolean(payload.consoleHidden);

    windowState.payload = payload;
    return payload;
}

/**
 * @function renderBrowserApp
 * @param {object} windowState Window state.
 * @param {HTMLElement} container Mount.
 * @param {object} desktopState Desktop state.
 * @param {object} env Environment.
 * @returns {void}
 */
export function renderBrowserApp(windowState, container, desktopState, env) {
    const payload = healPayload(windowState);
    const root = H(browserBlueprint(payload));

    container.replaceChildren(root);

    const address = root.querySelector('.vos-browser-address');
    const frame = root.querySelector('.vos-browser-frame');
    const lines = root.querySelector('.vos-browser-console-lines');

    const navigate = (nextUrl, addHistory = true) => {
        const route = resolveBrowserAddress(nextUrl);

        if (addHistory && payload.url && payload.url !== route.url) payload.history.push(payload.url);

        payload.url = route.url;
        address.value = route.url;

        appendConsoleLine(lines, 'nav', route.url);

        if (route.type === 'real-url') {
            frame.removeAttribute('srcdoc');
            frame.src = route.url;
        } else {
            frame.removeAttribute('src');
            frame.srcdoc = route.html;
        }

        env.requestRender();
    };

    root.querySelector('[data-action="go"]').onclick = () => navigate(address.value);
    root.querySelector('[data-action="reload"]').onclick = () => navigate(payload.url, false);
    root.querySelector('[data-action="home"]').onclick = () => navigate('about:blank');
    root.querySelector('[data-action="console"]').onclick = () => {
        payload.consoleHidden = !payload.consoleHidden;
        env.requestRender();
    };

    root.querySelector('[data-action="back"]').onclick = () => {
        const previous = payload.history.pop();
        if (previous) navigate(previous, false);
    };

    address.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') navigate(address.value);
    });

    installBrowserConsoleBridge(frame, lines);

    const route = resolveBrowserAddress(payload.url);
    if (route.type === 'real-url') frame.src = route.url;
    else frame.srcdoc = route.html;
}
