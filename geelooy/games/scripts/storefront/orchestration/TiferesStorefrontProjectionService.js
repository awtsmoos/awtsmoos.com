//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TiferesStorefrontProjectionService.js
 * @description Owns the data-to-view projection flow for query and tag changes without owning browser event lifetime.
 * The Awtsmoos is beyond every filtered appearance while Awtsmoos.com lets Tiferes harmonize data into visible order;
 * Gevurah remembers the request, Binah groups the worlds, and Malchus reveals only what the present doorway should afford.
 */

/**
 * Application service that projects discovery state into retractable filters and grouped catalog manifestation.
 */
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
	 * Reveals initial totals, optional filter controls, and the complete catalog projection.
	 * @returns {void}
	 */
	revealInitialProjection() {
		this.malchusCatalogView.setTotals(this.chochmahCatalog.GAMES.length);
		this.revealTagProjection();
		this.revealCatalogProjection();
	}

	/**
	 * Replaces Gevurah search truth and reprojects only catalog results.
	 * @param {string} hodQuery Current user-entered search language.
	 * @returns {void}
	 */
	revealQueryProjection(hodQuery) {
		this.gevurahQueryModel.setQuery(hodQuery);
		this.revealCatalogProjection();
	}

	/**
	 * Replaces Gevurah tag truth and synchronizes both optional filters and visible catalog.
	 * @param {string} gevurahActiveTag Selected optional filter tag.
	 * @returns {void}
	 */
	revealActiveTagProjection(gevurahActiveTag) {
		this.gevurahQueryModel.setActiveTag(gevurahActiveTag);
		this.revealTagProjection();
		this.revealCatalogProjection();
	}

	/**
	 * Manifests the current tag vocabulary and selected state from immutable catalog/query data.
	 * @returns {void}
	 */
	revealTagProjection() {
		const gevurahSnapshot = this.gevurahQueryModel.snapshot();
		const hodCatalogTags = this.gevurahStateApi.collectTags(this.chochmahCatalog.GAMES);
		this.malchusFilterView.renderTags(hodCatalogTags, gevurahSnapshot.activeTag);
	}

	/**
	 * Filters, groups, and manifests one catalog projection without consulting DOM state.
	 * @returns {void}
	 */
	revealCatalogProjection() {
		const gevurahSnapshot = this.gevurahQueryModel.snapshot();
		const gevurahVisibleGames = this.gevurahStateApi.filterGames(
			this.chochmahCatalog.GAMES,
			gevurahSnapshot.query,
			gevurahSnapshot.activeTag
		);
		const binahCollectionSections = this.gevurahStateApi.groupGames(
			gevurahVisibleGames,
			this.chochmahCatalog.GAME_COLLECTIONS
		);
		this.malchusCatalogView.renderCatalog({
			visibleGames: gevurahVisibleGames,
			totalGames: this.chochmahCatalog.GAMES.length,
			sections: binahCollectionSections,
			sectionMarkup: this.malchusMarkupApi.gameSectionMarkup
		});
	}
}
