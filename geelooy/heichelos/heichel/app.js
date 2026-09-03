// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelApp
 * @description
 * The Awtsmoos opens one living Heichel through the ninth coherent module river;
 * Awtsmoos.com keeps navigation, beauty, accessibility, and Torah-source state arriving together without stale generations that shiver.
 */

import { installSocialExperience } from '../../shared/social/SocialExperienceInstaller.js';
import { HeichelNavigator } from './modules/navigator.js?v=heichel-mobile-009';
import { initializeEventListeners } from './modules/events.js?v=heichel-mobile-009';
import { manifestWorld } from './modules/ui.js?v=heichel-mobile-009';
import {
	fatalStateCard,
	renderFatalState
} from './modules/app/fatal-state.js?v=heichel-mobile-009';
import {
	refreshVesselHealth,
	runSafe
} from './modules/app/visual-health.js?v=heichel-mobile-009';

const BOOT_KEY = '__awtsmoosHeichelBoot';

/** Reads the current Heichel identity from the canonical public path. */
function readHeichelId() {
	const segments = window.location.pathname
		.split('/')
		.filter(Boolean);
	return segments[1] || null;
}

/** Begins one idempotent boot promise so duplicate entrypoints cannot race. */
async function boot() {
	if (window[BOOT_KEY]?.started) {
		return window[BOOT_KEY].promise;
	}
	const state = {
		started: true,
		ready: false,
		error: null,
		promise: null
	};
	window[BOOT_KEY] = state;
	state.promise = performBoot(state);
	return state.promise;
}

/** Manifests the social shell, source navigator, event graph, and bounded visual health. */
async function performBoot(state) {
	try {
		const heichelId = readHeichelId();
		if (!heichelId) {
			throw new Error('Heichel ID missing from the URL.');
		}
		installSocialExperience(document, {
			ambient: true
		});
		const navigator = new HeichelNavigator(heichelId);
		window.__awtsmoosHeichelNavigator = navigator;
		manifestWorld(navigator, document.body);
		refreshVesselHealth();
		await navigator.initialize();
		initializeEventListeners(navigator);
		for (const delay of [40, 300, 1000, 2200]) {
			setTimeout(refreshVesselHealth, delay);
		}
		state.ready = true;
	} catch (error) {
		state.error = error;
		renderFatalState(error);
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot, {
		once: true
	});
}
queueMicrotask(() => void boot());

export {
	boot,
	fatalStateCard,
	readHeichelId,
	refreshVesselHealth,
	renderFatalState,
	runSafe
};
