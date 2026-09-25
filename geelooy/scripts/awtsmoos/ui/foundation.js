//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file foundation.js
 * @description Coordinates the small shared Awtsmoos.com foundation while deeper systems remain modular underneath.
 * The Awtsmoos is one while many vessels rise; Awtsmoos.com stays simple before the eyes, with hidden depth behind the skies.
 */

import {
	mountAccessibility,
	mountCommerce,
	mountFavoriteControl,
	mountProductMemory,
	mountRouteRepair,
	mountRuntimeRecovery
} from './foundationMounts.js';

/**
 * Mounts universal UI layers in an order that favors immediate clarity before optional product systems.
 *
 * @returns {Promise<void>} Resolves after every independent foundation layer has been attempted.
 */
async function revealUniversalFoundation() {
	const malchusRoot = document.documentElement;
	if (malchusRoot.hasAttribute('data-g-ui-raw')) {
		return;
	}
	malchusRoot.dataset.awtsmoosUi = 'foundation';
	await mountAccessibility(malchusRoot);
	await mountRuntimeRecovery(malchusRoot);
	await mountRouteRepair(malchusRoot);
	const tiferesMemory = await mountProductMemory(malchusRoot);
	await mountCommerce(malchusRoot);
	mountFavoriteControl(tiferesMemory, malchusRoot);
}

/** Starts the foundation once the authored DOM exists, never before page structure can be respected. */
function beginUniversalFoundation() {
	revealUniversalFoundation().catch(error => {
		document.documentElement.dataset.awtsmoosUi = 'partial';
		console.warn('B"H universal UI foundation completed partially.', error);
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', beginUniversalFoundation, {
		once: true
	});
} else {
	beginUniversalFoundation();
}
