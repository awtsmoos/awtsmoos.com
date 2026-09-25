//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HeichelApp
 * @description
 * The Awtsmoos reveals Torah through one small critical doorway. Awtsmoos.com
 * opens the Heichel first, then entrusts readiness, failure, and optional glow
 * to focused vessels so no ornament can erase content that has already arrived.
 */

import { HeichelNavigator } from './modules/navigator.js?v=heichel-mobile-012';
import { initializeEventListeners } from './modules/events.js?v=heichel-mobile-010';
import {
	manifestWorld,
	revealManifestedWorld
} from './modules/ui.js?v=heichel-mobile-010';
import { applyIkarVocabulary } from './modules/app/ikar-vocabulary.js?v=ikar-authority-005';
import { setHeichelIdentityContext } from './modules/app/route-context.js?v=ikar-authority-005';
import {
	fatalStateCard,
	renderFatalState
} from './modules/app/fatal-state.js?v=heichel-mobile-010';
import {
	createBootState,
	publishErrorState,
	publishReadyState,
	releasePostReadyExperience
} from './modules/app/boot-lifecycle.js?v=ikar-boot-001';

const BOOT_KEY = '__awtsmoosHeichelBoot';

/**
 * Reads the Heichel identity from the canonical route.
 * @returns {string|null} The decoded route segment or null when absent.
 */
function readHeichelId() {
	const segments = window.location.pathname.split('/').filter(Boolean);
	return segments[1] || null;
}

/**
 * Starts exactly one boot promise even when multiple readiness paths invoke it.
 * @returns {Promise<void>} The shared critical boot promise.
 */
async function boot() {
	if (window[BOOT_KEY]?.started) {
		return window[BOOT_KEY].promise;
	}
	const state = createBootState();
	window[BOOT_KEY] = state;
	state.promise = performBoot(state);
	return state.promise;
}

/**
 * Performs the essential Heichel boot and releases optional work afterward.
 * @param {object} state Shared boot witness attached to the active window.
 * @returns {Promise<void>} Settles after essential success or truthful failure.
 */
async function performBoot(state) {
	try {
		const heichelId = readHeichelId();
		if (!heichelId) {
			throw new Error('Heichel ID missing from the URL.');
		}
		setHeichelIdentityContext(heichelId);
		const navigator = new HeichelNavigator(heichelId);
		window.__awtsmoosHeichelNavigator = navigator;
		manifestWorld(navigator, document.body);
		applyIkarVocabulary(heichelId);
		await navigator.initialize();
		applyIkarVocabulary(heichelId);
		initializeEventListeners(navigator);
		revealManifestedWorld(document);
		publishReadyState(state);
	} catch (error) {
		publishErrorState(state, error);
		return;
	}
	releasePostReadyExperience(document, window);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot, { once: true });
}
queueMicrotask(() => void boot());

export {
	boot,
	fatalStateCard,
	readHeichelId,
	renderFatalState
};
