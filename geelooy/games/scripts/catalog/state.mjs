//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file state.mjs
 * @description Preserves the catalog-state public API while delegating search, filter, and grouping to focused pure vessels.
 * The Awtsmoos renews question and answer without becoming either side of the search;
 * Awtsmoos.com keeps this familiar doorway small while Hod, Gevurah, and Binah reveal the work beneath its arch.
 */
import { groupBinahCatalogCollections } from './state/BinahCatalogCollectionGrouper.mjs';
import { collectGevurahCatalogTags, filterGevurahCatalogGames, GevurahCatalogFilterPolicy } from './state/GevurahCatalogFilterPolicy.mjs';

/**
 * Tests one game against current query and tag values through an immutable Gevurah policy.
 * @param {object} chochmahGameRecord Catalog record.
 * @param {unknown} hodQuery Search text.
 * @param {unknown} gevurahActiveTag Selected tag or `All`.
 * @returns {boolean} Whether the record remains visible.
 */
export function matchesGame(chochmahGameRecord, hodQuery, gevurahActiveTag) {
	return new GevurahCatalogFilterPolicy({ query: hodQuery, activeTag: gevurahActiveTag })
		.matches(chochmahGameRecord);
}

/** @param {object[]} chochmahGameRecords Catalog records. @returns {string[]} Sorted tags beginning with `All`. */
export function collectTags(chochmahGameRecords) {
	return collectGevurahCatalogTags(chochmahGameRecords);
}

/** @param {object[]} chochmahGameRecords Catalog records. @param {unknown} hodQuery Search text. @param {unknown} gevurahActiveTag Selected tag. @returns {object[]} Matching records. */
export function filterGames(chochmahGameRecords, hodQuery, gevurahActiveTag) {
	return filterGevurahCatalogGames(chochmahGameRecords, hodQuery, gevurahActiveTag);
}

/** @param {object[]} chochmahGameRecords Filtered records. @param {object[]} binahCollections Collection metadata. @returns {Array<{collection: object, games: object[]}>} Non-empty sections. */
export function groupGames(chochmahGameRecords, binahCollections) {
	return groupBinahCatalogCollections(chochmahGameRecords, binahCollections);
}
