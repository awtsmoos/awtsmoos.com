//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GevurahCatalogFilterPolicy.mjs
 * @description Owns the pure text-and-tag boundary deciding which game records remain visible.
 * The Awtsmoos gives every world its being while Gevurah measures which doorway answers the present request;
 * Awtsmoos.com keeps that boundary deterministic so filtering stays a transparent covenant, never a UI guess.
 */
import { buildHodCatalogSearchText, normalizeHodCatalogQuery } from './HodCatalogSearchText.mjs';

/**
 * Immutable matching policy for one current storefront query/tag snapshot.
 */
export class GevurahCatalogFilterPolicy {
	/**
	 * @param {object} gevurahSelection Current discovery selection.
	 * @param {unknown} gevurahSelection.query User search value.
	 * @param {unknown} gevurahSelection.activeTag Selected tag or `All`.
	 */
	constructor({ query, activeTag }) {
		this.hodNormalizedQuery = normalizeHodCatalogQuery(query);
		this.gevurahActiveTag = String(activeTag || 'All');
	}

	/**
	 * Tests one catalog record against the policy's normalized text and tag boundaries.
	 *
	 * @param {object} chochmahGameRecord Candidate game record.
	 * @returns {boolean} True when both tag and text conditions permit this game to remain visible.
	 */
	matches(chochmahGameRecord) {
		const gevurahTags = Array.isArray(chochmahGameRecord.tags)
			? chochmahGameRecord.tags
			: [];
		const gevurahTagMatches = this.gevurahActiveTag === 'All'
			|| gevurahTags.includes(this.gevurahActiveTag);
		const hodTextMatches = !this.hodNormalizedQuery
			|| buildHodCatalogSearchText(chochmahGameRecord).includes(this.hodNormalizedQuery);

		return gevurahTagMatches && hodTextMatches;
	}
}

/**
 * Collects a sorted unique tag vocabulary while preserving the explicit `All` escape hatch first.
 *
 * @param {object[]} chochmahGameRecords Complete catalog records.
 * @returns {string[]} Fresh sorted tag list beginning with `All`.
 */
export function collectGevurahCatalogTags(chochmahGameRecords) {
	const binahTagSet = new Set();
	for (const chochmahGameRecord of chochmahGameRecords) {
		for (const hodTag of chochmahGameRecord.tags || []) {
			binahTagSet.add(hodTag);
		}
	}

	return ['All', ...Array.from(binahTagSet).sort(compareHodTags)];
}

/**
 * Filters records in original marketing order through one immutable Gevurah policy.
 *
 * @param {object[]} chochmahGameRecords Complete catalog.
 * @param {unknown} hodQuery Search query.
 * @param {unknown} gevurahActiveTag Selected filter tag.
 * @returns {object[]} Matching records in original order.
 */
export function filterGevurahCatalogGames(chochmahGameRecords, hodQuery, gevurahActiveTag) {
	const gevurahPolicy = new GevurahCatalogFilterPolicy({ query: hodQuery, activeTag: gevurahActiveTag });
	return chochmahGameRecords.filter(keepGevurahMatchingGame.bind(null, gevurahPolicy));
}

/** @param {GevurahCatalogFilterPolicy} gevurahPolicy Filter policy. @param {object} chochmahGameRecord Game record. @returns {boolean} */
function keepGevurahMatchingGame(gevurahPolicy, chochmahGameRecord) {
	return gevurahPolicy.matches(chochmahGameRecord);
}

/** @param {string} hodLeftTag Left tag. @param {string} hodRightTag Right tag. @returns {number} Locale ordering result. */
function compareHodTags(hodLeftTag, hodRightTag) {
	return hodLeftTag.localeCompare(hodRightTag);
}
