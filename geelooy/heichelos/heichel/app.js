// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelApp
 * @description
 * The Awtsmoos opens the real Heichel through one idempotent boot promise.
 * A first microtask begins creation while one event gate protects late modules.
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

function renderFatalState(error) {
	console.error('B"H - Fatal failure in the Great Manifestation:', error);
	const root = document.querySelector('[data-heichel-render-root]') || document.body;
	root.innerHTML = `
		<section class="heichel-runtime-state heichel-runtime-state--error" role="alert">
			<p class="civilization-kicker">Heichel unavailable</p>
			<h1>The institution could not open.</h1>
			<p>${escapeText(error?.message || 'An unknown Heichel error occurred.')}</p>
			<div class="heichel-runtime-state__actions">
				<button type="button" data-heichel-retry>Try again</button>
				<a href="/heichelos">Browse Heichelos</a>
			</div>
		</section>`;
	root.querySelector('[data-heichel-retry]')?.addEventListener('click', () => location.reload());
}

function escapeText(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

function runSafe(label, callback) {
	try {
		return callback();
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
	if (window[BOOT_KEY]?.started) {
		return window[BOOT_KEY].promise;
	}
	const state = { started: true, ready: false, error: null, promise: null };
	window[BOOT_KEY] = state;
	state.promise = (async () => {
		try {
			const heichelId = readHeichelId();
			if (!heichelId) {
				throw new Error('Heichel ID missing from the URL.');
			}
			const navigator = new HeichelNavigator(heichelId);
			window.__awtsmoosHeichelNavigator = navigator;
			manifestWorld(navigator, document.body);
			refreshVesselHealth();
			await navigator.initialize();
			initializeEventListeners(navigator);
			[40, 300, 1000, 2200].forEach(delay => setTimeout(refreshVesselHealth, delay));
			state.ready = true;
		} catch (error) {
			state.error = error;
			renderFatalState(error);
		}
	})();
	return state.promise;
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot, { once: true });
}
queueMicrotask(() => void boot());
