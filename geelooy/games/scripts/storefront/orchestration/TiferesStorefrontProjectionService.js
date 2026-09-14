//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file TiferesStorefrontProjectionService.js
 * @description
 * Harmonizes game filtering, route-only recent priority, grouping, and manifestation.
 * The Awtsmoos is beyond every sequence while Awtsmoos.com lets Tiferes remember
 * chosen doorways without changing filter truth: Gevurah selects, continuity orders,
 * Binah groups, and Malchus reveals the resulting playable worlds.
 */

import {
	prioritizeRecentRecords
} from "../../../../scripts/awtsmoos/ui/productMemoryCatalog.js";

/** Application service projecting discovery state into grouped catalog manifestation. */
export class TiferesStorefrontProjectionService {
	/**
	 * @param {object} tiferesDependencies Projection collaborators.
	 * @param {object} tiferesDependencies.chochmahCatalog Immutable catalog data.
	 * @param {object} tiferesDependencies.gevurahStateApi Pure filter/grouping policy API.
	 * @param {object} tiferesDependencies.malchusMarkupApi Escaped collection markup API.
	 * @param {object} tiferesDependencies.gevurahQueryModel Mutable query/tag truth.
	 * @param {object} tiferesDependencies.malchusFilterView Retractable filter view.
	 * @param {object} tiferesDependencies.malchusCatalogView Catalog/count/status view.
	 */
	constructor({
		chochmahCatalog,
		gevurahStateApi,
		malchusMarkupApi,
		gevurahQueryModel,
		malchusFilterView,
		malchusCatalogView
	}) {
		this.chochmahCatalog = chochmahCatalog;
		this.gevurahStateApi = gevurahStateApi;
		this.malchusMarkupApi = malchusMarkupApi;
		this.gevurahQueryModel = gevurahQueryModel;
		this.malchusFilterView = malchusFilterView;
		this.malchusCatalogView = malchusCatalogView;
	}

	/**
	 * Reveals totals, filter controls, and the complete recent-aware catalog projection.
	 *
	 * @returns {void}
	 */
	revealInitialProjection() {
		this.malchusCatalogView.setTotals(this.chochmahCatalog.GAMES.length);
		this.revealTagProjection();
		this.revealCatalogProjection();
	}

	/** @param {string} hodQuery Current search language. @returns {void} */
	revealQueryProjection(hodQuery) {
		this.gevurahQueryModel.setQuery(hodQuery);
		this.revealCatalogProjection();
	}

	/** @param {string} gevurahActiveTag Selected optional filter tag. @returns {void} */
	revealActiveTagProjection(gevurahActiveTag) {
		this.gevurahQueryModel.setActiveTag(gevurahActiveTag);
		this.revealTagProjection();
		this.revealCatalogProjection();
	}

	/**
	 * Manifests the current tag vocabulary and selected state from immutable data.
	 *
	 * @returns {void}
	 */
	revealTagProjection() {
		const gevurahSnapshot = this.gevurahQueryModel.snapshot();
		const hodCatalogTags = this.gevurahStateApi.collectTags(
			this.chochmahCatalog.GAMES
		);
		this.malchusFilterView.renderTags(
			hodCatalogTags,
			gevurahSnapshot.activeTag
		);
	}

	/**
	 * Filters, recent-orders, groups, and manifests one catalog projection.
	 *
	 * @returns {void}
	 */
	revealCatalogProjection() {
		const gevurahSnapshot = this.gevurahQueryModel.snapshot();
		const netzachFilteredGames = this.gevurahStateApi.filterGames(
			this.chochmahCatalog.GAMES,
			gevurahSnapshot.query,
			gevurahSnapshot.activeTag
		);
		const yesodBaseHref = globalThis.location?.href
			|| "https://awtsmoos.com/games/";
		const tiferesVisibleGames = prioritizeRecentRecords(
			netzachFilteredGames,
			yesodBaseHref
		);
		const binahCollectionSections = this.gevurahStateApi.groupGames(
			tiferesVisibleGames,
			this.chochmahCatalog.GAME_COLLECTIONS
		);
		this.malchusCatalogView.renderCatalog({
			visibleGames: tiferesVisibleGames,
			totalGames: this.chochmahCatalog.GAMES.length,
			sections: binahCollectionSections,
			sectionMarkup: this.malchusMarkupApi.gameSectionMarkup
		});
	}
}
