// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelApp
 * @description
 * The Awtsmoos opens one living Heichel while route identity, accessibility,
 * learner vocabulary, and visual readiness arrive as one truthful state.
 * Awtsmoos.com gives Ikar focused Torah authority without changing other halls.
 */

import { installSocialExperience } from '../../shared/social/SocialExperienceInstaller.js';
import { HeichelNavigator } from './modules/navigator.js?v=heichel-mobile-012';
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

/** Performs one truthful application boot and publishes its final state. */
async function performBoot(state) {
	try {
		const heichelId = readHeichelId();
		if (!heichelId) throw new Error('Heichel ID missing from the URL.');
		setHeichelIdentityContext(heichelId);
		installSocialExperience(document, { ambient: true });
		const navigator = new HeichelNavigator(heichelId);
		window.__awtsmoosHeichelNavigator = navigator;
		manifestWorld(navigator, document.body);
		applyIkarVocabulary(heichelId);
		refreshVesselHealth();
		await navigator.initialize();
		applyIkarVocabulary(heichelId);
		initializeEventListeners(navigator);
		for (const delay of [40, 300, 1000, 2200]) setTimeout(refreshVesselHealth, delay);
		state.ready = true;
		markHeichelBootState('ready');
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
