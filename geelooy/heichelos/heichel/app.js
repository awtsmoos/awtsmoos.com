//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HeichelApp
 * @description
 * The Awtsmoos opens one living Heichel through the smallest truthful critical
 * path. Torah navigation becomes usable first; social, cosmic, and hybrid-route
 * enhancements are deliberately released afterward by ProgressiveEnhancements.
 */

import { HeichelNavigator } from './modules/navigator.js?v=heichel-mobile-013';
import { initializeEventListeners } from './modules/events.js?v=heichel-mobile-010';
import { manifestWorld } from './modules/ui.js?v=heichel-mobile-010';
import { applyIkarVocabulary } from './modules/app/ikar-vocabulary.js?v=ikar-authority-005';
import {
	markHeichelBootState,
	setHeichelIdentityContext
} from './modules/app/route-context.js?v=ikar-authority-005';
import {
	fatalStateCard,
	renderFatalState
} from './modules/app/fatal-state.js?v=heichel-mobile-010';
import {
	refreshVesselHealth,
	runSafe
} from './modules/app/visual-health.js?v=heichel-mobile-010';

const BOOT_KEY = '__awtsmoosHeichelBoot';

/** Returns the Heichel id encoded in the canonical route. */
function readHeichelId() {
	const segments = window.location.pathname.split('/').filter(Boolean);
	return segments[1] || null;
}
/** Starts exactly one boot promise even when both DOM readiness paths call it. */
async function boot() {
	if (window[BOOT_KEY]?.started) return window[BOOT_KEY].promise;
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

/** Performs only the critical Heichel boot and publishes its final state. */
async function performBoot(state) {
	try {
		const heichelId = readHeichelId();
		if (!heichelId) throw new Error('Heichel ID missing from the URL.');
		setHeichelIdentityContext(heichelId);
		const navigator = new HeichelNavigator(heichelId);
		window.__awtsmoosHeichelNavigator = navigator;
		manifestWorld(navigator, document.body);
		applyIkarVocabulary(heichelId);
		refreshVesselHealth();
		await navigator.initialize();
		applyIkarVocabulary(heichelId);
		initializeEventListeners(navigator);
		state.ready = true;
		markHeichelBootState('ready');
		for (const delay of [40, 300, 1000, 2200]) setTimeout(refreshVesselHealth, delay);
	} catch (error) {
		state.error = error;
		markHeichelBootState('error');
		renderFatalState(error);
	}
}
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot, { once: true });
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
