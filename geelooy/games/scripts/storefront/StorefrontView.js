//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StorefrontView.js
 * @description Preserves the historic StorefrontView doorway while composing the deeper Sefirah-organized runtime beneath it.
 * The Awtsmoos is beyond every compatibility door while Awtsmoos.com lets older callers enter a clearer hall;
 * Tiferes coordinates, Gevurah remembers, Malchus reveals, and Yesod listens without asking one object to become all.
 */
import { normalizeBinahStorefrontDomContract } from './contracts/BinahStorefrontDomContract.js';
import { GevurahStorefrontQueryModel } from './model/GevurahStorefrontQueryModel.js';
import { TiferesStorefrontCoordinator } from './orchestration/TiferesStorefrontCoordinator.js';
import { TiferesStorefrontProjectionService } from './orchestration/TiferesStorefrontProjectionService.js';
import { MalchusStorefrontCatalogView } from './presentation/MalchusStorefrontCatalogView.js';
import { MalchusStorefrontFilterView } from './presentation/MalchusStorefrontFilterView.js';

/**
 * Compatibility facade retaining the historical constructor shape while delegating all behavior inward.
 * Existing callers see one simple API while advanced state, projection, and event lifetimes remain modular beneath it.
 */
export class StorefrontView {
	/**
	 * Composes focused Storefront collaborators around the existing four-argument API.
	 * @param {object} binahDomShape Legacy or named DOM contract.
	 * @param {object} chochmahCatalog Immutable catalog exports.
	 * @param {object} gevurahStateApi Pure filtering/grouping API.
	 * @param {object} malchusMarkupApi Escaped card/collection markup API.
	 */
	constructor(binahDomShape, chochmahCatalog, gevurahStateApi, malchusMarkupApi) {
		const binahDomContract = normalizeBinahStorefrontDomContract(binahDomShape);
		const gevurahQueryModel = new GevurahStorefrontQueryModel();
		const malchusFilterView = new MalchusStorefrontFilterView(binahDomContract);
		const malchusCatalogView = new MalchusStorefrontCatalogView(binahDomContract);
		const tiferesProjectionService = new TiferesStorefrontProjectionService({
			chochmahCatalog,
			gevurahStateApi,
			malchusMarkupApi,
			gevurahQueryModel,
			malchusFilterView,
			malchusCatalogView
		});
		this.tiferesStorefrontCoordinator = new TiferesStorefrontCoordinator({
			binahDomContract,
			tiferesProjectionService
		});
	}

	/**
	 * Mounts the composed Storefront and connects delegated interaction lifetime.
	 * @returns {void}
	 */
	mount() {
		this.tiferesStorefrontCoordinator.mount();
	}

	/**
	 * Disconnects the Storefront interaction lifetime without mutating unrelated Games-hub DOM.
	 * @returns {void}
	 */
	unmount() {
		this.tiferesStorefrontCoordinator.unmount();
	}
}
