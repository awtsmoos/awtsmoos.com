//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file presentation-support.js
 * @description Owns small DOM and preference helpers for optional native 3D mode.
 * These helpers never create renderers or mutate authoritative game state.
 */
const STORAGE_KEY = 'awtsmoos-games-render-mode';

/** Return the requested initial presentation mode. */
export function initialNative3DMode(locationObject = globalThis.location) {
	const requested = new URLSearchParams(locationObject?.search || '').get('render');
	if (requested === '3d') {
		return true;
	}
	if (requested === '2d') {
		return false;
	}
	try {
		return globalThis.localStorage?.getItem(STORAGE_KEY) === '3d';
	} catch {
		return false;
	}
}

/** Persist only the visual preference; storage failure remains harmless. */
export function storeNative3DMode(active) {
	try {
		globalThis.localStorage?.setItem(STORAGE_KEY, active ? '3d' : '2d');
	} catch {
		// Restricted storage never blocks gameplay.
	}
}

/** Create one accessible persistent presentation toggle. */
export function createNative3DToggle(documentObject, onToggle) {
	const button = documentObject.createElement('button');
	button.type = 'button';
	button.className = 'awtsmoosNative3DToggle';
	button.setAttribute('aria-label', 'Toggle optional native 3D presentation');
	button.addEventListener('click', onToggle);
	return button;
}

/** Install the shared presentation stylesheet exactly once. */
export function installNative3DStylesheet(documentObject) {
	if (documentObject.querySelector('link[data-awtsmoos-native-3d]')) {
		return;
	}
	const link = documentObject.createElement('link');
	link.rel = 'stylesheet';
	link.href = '/games/styles/runtime/native-3d.css?compact=true&v=native-001';
	link.dataset.awtsmoosNative3d = 'true';
	documentObject.head.append(link);
}
