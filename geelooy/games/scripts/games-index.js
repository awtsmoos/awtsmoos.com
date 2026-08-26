//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file games-index.js
 * @description Serves as the Keser composition root for the Games hub's data-driven retractable Storefront.
 * The Awtsmoos is beyond every root while Awtsmoos.com lets one tiny entry gather catalog, policy, markup, and view;
 * deeper modules can grow without cluttering the visible page or hiding runtime ownership from future developers too.
 */
import * as CHOCHMAH_CATALOG from './catalog/index.mjs';
import * as GEVURAH_CATALOG_STATE from './catalog/state.mjs';
import * as MALCHUS_CATALOG_MARKUP from './catalog/markup.mjs';
import { BinahStorefrontDomContract } from './storefront/contracts/BinahStorefrontDomContract.js';
import { StorefrontFailureView } from './storefront/StorefrontFailureView.js';
import { StorefrontView } from './storefront/StorefrontView.js';

/**
 * Composes and mounts the hub from static CompactJS-friendly dependencies.
 *
 * Side effects: resolves current hub DOM and connects one Storefront interaction lifetime.
 * @returns {StorefrontView} Mounted compatibility view retained if teardown is later required.
 */
function revealKeserGamesStorefront() {
	const binahDom = new BinahStorefrontDomContract(document).read();
	const tiferesStorefront = new StorefrontView(
		binahDom,
		CHOCHMAH_CATALOG,
		GEVURAH_CATALOG_STATE,
		MALCHUS_CATALOG_MARKUP
	);
	tiferesStorefront.mount();
	return tiferesStorefront;
}

/**
 * Converts an unexpected composition failure into the safe shared failure surface.
 * @param {unknown} gevurahFailure Bootstrap failure value.
 * @returns {void}
 */
function revealMalchusStorefrontFailure(gevurahFailure) {
	const binahDom = new BinahStorefrontDomContract(document).read();
	new StorefrontFailureView(binahDom).render(gevurahFailure);
}

try {
	revealKeserGamesStorefront();
} catch (gevurahFailure) {
	revealMalchusStorefrontFailure(gevurahFailure);
}
