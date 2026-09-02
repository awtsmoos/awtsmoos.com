// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelApp
 * @description
 * The Awtsmoos opens one living Heichel through one freshly-versioned module river;
 * Awtsmoos.com keeps mobile state, navigation, beauty, and optional tools arriving together.
 */

import { installSocialExperience } from '../../shared/social/SocialExperienceInstaller.js';
import { HeichelNavigator } from './modules/navigator.js?v=heichel-mobile-007';
import { initializeEventListeners } from './modules/events.js?v=heichel-mobile-007';
import { manifestWorld } from './modules/ui.js?v=heichel-mobile-007';
import { runHeichelVisualDiagnostics } from './modules/visual/index.js?v=heichel-mobile-007';
import { runHeichelBeauty } from './modules/beauty/index.js?v=heichel-mobile-007';
import { runHeichelLegend } from './modules/legend/index.js?v=heichel-mobile-007';

const BOOT_KEY = '__awtsmoosHeichelBoot';

function readHeichelId() {
	const segments = window.location.pathname.split('/').filter(Boolean);
	return segments[1] || null;
}

function renderFatalState(error) {
	console.error('B"H - Fatal failure in the Great Manifestation:', error);
	const root = document.querySelector('[data-heichel-render-root]') || document.body;
	root.replaceChildren(fatalStateCard(error));
}

function fatalStateCard(error) {
	const section = document.createElement('section');
	section.className = 'heichel-runtime-state heichel-runtime-state--error';
	section.setAttribute('role', 'alert');
	const kicker = document.createElement('p');
	kicker.className = 'civilization-kicker';
	kicker.textContent = 'Heichel unavailable';
	const title = document.createElement('h1');
	title.textContent = 'The institution could not open.';
	const message = document.createElement('p');
	message.textContent = error?.message || 'An unknown Heichel error occurred.';
	const actions = document.createElement('div');
	actions.className = 'heichel-runtime-state__actions';
	const retry = document.createElement('button');
	retry.type = 'button';
	retry.textContent = 'Try again';
	retry.addEventListener('click', () => location.reload());
	const browse = document.createElement('a');
	browse.href = '/heichelos';
	browse.textContent = 'Browse Heichelos';
	actions.append(retry, browse);
	section.append(kicker, title, message, actions);
	return section;
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
	if (window[BOOT_KEY]?.started) return window[BOOT_KEY].promise;
	const state = { started: true, ready: false, error: null, promise: null };
	window[BOOT_KEY] = state;
	state.promise = (async () => {
		try {
			const heichelId = readHeichelId();
			if (!heichelId) throw new Error('Heichel ID missing from the URL.');
			installSocialExperience(document, { ambient: true });
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

export { boot, fatalStateCard, readHeichelId, refreshVesselHealth, renderFatalState, runSafe };
