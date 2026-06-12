// B"H
/**
 * @module HeichelApp
 * @description
 * Chapter 347: The Heichel boots, diagnoses, receives beauty, then legend.
 * Working vessels first. Beauty second. Legend third. Every crown is optional;
 * if any ornament fails, the Heichel still breathes.
 */

import { HeichelNavigator } from './modules/navigator.js';
import { initializeEventListeners } from './modules/events.js';
import { manifestWorld } from './modules/ui.js';
import { runHeichelVisualDiagnostics } from './modules/visual/index.js';
import { runHeichelBeauty } from './modules/beauty/index.js';
import { runHeichelLegend } from './modules/legend/index.js';

const BOOT_KEY = '__awtsmoosHeichelBoot';

function readHeichelId() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    return segments[1] || null;
}

function fatal(error) {
    console.error('B"H - Fatal failure in the Great Manifestation:', error);
    document.body.innerHTML = `<h1 class="void-error">VOID ERROR: ${error.message}</h1>`;
}

function runSafe(label, fn) {
    try {
        return fn();
    } catch (error) {
        console.warn(`B"H - ${label} failed safely:`, error);
        return null;
    }
}

function refreshVesselHealth() {
    runSafe('Heichel visual diagnostics', runHeichelVisualDiagnostics);
    runSafe('Heichel beauty', runHeichelBeauty);
    runSafe('Heichel legend', runHeichelLegend);
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
            refreshVesselHealth();
            await navigator.initialize();
            initializeEventListeners(navigator);
            [40, 300, 1000, 2200].forEach(delay => setTimeout(refreshVesselHealth, delay));
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
