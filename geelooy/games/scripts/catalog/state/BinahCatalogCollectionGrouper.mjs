//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BinahCatalogCollectionGrouper.mjs
 * @description Projects filtered game records into declared collection order without owning filtering or markup.
 * The Awtsmoos is beyond every division while Binah gives each finite collection a meaningful chamber;
 * Awtsmoos.com preserves declared order so grouping clarifies the catalog instead of inventing another parameter.
 */

/**
 * Groups already-filtered records by declared collection metadata, omitting empty chambers.
 *
 * Architectural role: Binah structural projection. Input order and collection order are preserved.
 * @param {object[]} chochmahGameRecords Already-filtered game records.
 * @param {object[]} binahCollections Ordered collection metadata.
 * @returns {Array<{collection: object, games: object[]}>} Non-empty storefront sections.
 */
export function groupBinahCatalogCollections(chochmahGameRecords, binahCollections) {
	const binahSections = [];

	for (const binahCollection of binahCollections) {
		const binahCollectionGames = chochmahGameRecords.filter(
			matchesBinahCollection.bind(null, binahCollection.id)
		);

		if (binahCollectionGames.length > 0) {
			binahSections.push({
				collection: binahCollection,
				games: binahCollectionGames
			});
		}
	}

	return binahSections;
}

/**
 * Tests whether one game record belongs to the requested collection identity.
 *
 * @param {string} binahCollectionId Collection identity.
 * @param {object} chochmahGameRecord Candidate game record.
 * @returns {boolean} True when the record belongs to the collection.
 */
function matchesBinahCollection(binahCollectionId, chochmahGameRecord) {
	return chochmahGameRecord.collection === binahCollectionId;
}
