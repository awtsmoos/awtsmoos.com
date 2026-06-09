// B"H
/**
 * @module HeichelApp
 * @description
 * Chapter 284: The entry spark fires once.
 *
 * The Heichel page may be visited through real browsers, synthetic runtimes,
 * cached modules, and impatient refreshes. This entry point now binds exactly
 * once, avoids duplicate worlds, and leaves a readable boot state for tests.
 */

import { HeichelNavigator } from './modules/navigator.js';
import { initializeEventListeners } from './modules/events.js';
import { manifestWorld } from './modules/ui.js';

const BOOT_KEY = '__awtsmoosHeichelBoot';

function readHeichelId() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    return segments[1] || null;
}

function fatal(error) {
    console.error('B"H - Fatal failure in the Great Manifestation:', error);
    document.body.innerHTML = `<h1 class="void-error">VOID ERROR: ${error.message}</h1>`;
}

async function boot() {
    if (window[BOOT_KEY]?.started) return window[BOOT_KEY].promise;
    const state = { started: true, ready: false, error: null, promise: null };
    window[BOOT_KEY] = state;
    state.promise = (async () => {
        try {
            console.log('B"H - Commencing Creation Ritual...');
            const heichelId = readHeichelId();
            if (!heichelId) throw new Error('Heichel ID missing from the URL.');
            const navigator = new HeichelNavigator(heichelId);
            window.__awtsmoosHeichelNavigator = navigator;
            manifestWorld(navigator, document.body);
            await navigator.initialize();
            initializeEventListeners(navigator);
            state.ready = true;
            console.log('B"H - The Library consciousness is fully manifest.');
        } catch (error) {
            state.error = error;
            fatal(error);
        }
    })();
    return state.promise;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
