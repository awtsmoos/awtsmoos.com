//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HodCatalogSearchText.mjs
 * @description Shapes one catalog record and one user query into stable lowercase search language.
 * The Awtsmoos is beyond every word while Hod lets finite names, hooks, genres, and modes speak in one line;
 * Awtsmoos.com keeps search text pure and inspectable so discovery never depends on a hidden DOM sign.
 */

/**
 * Builds the searchable text representation of one game record without mutating catalog data.
 *
 * Architectural role: Hod translation from structured product data into normalized search language.
 * @param {object} chochmahGameRecord Catalog record whose human-facing fields contribute to discovery.
 * @returns {string} Lowercase searchable text containing title, hook, description, genre, badge, modes, and tags.
 */
export function buildHodCatalogSearchText(chochmahGameRecord) {
	return [
		chochmahGameRecord.title,
		chochmahGameRecord.hook,
		chochmahGameRecord.description,
		chochmahGameRecord.genre,
		chochmahGameRecord.badge,
		chochmahGameRecord.visual?.label,
		chochmahGameRecord.solo?.label,
		chochmahGameRecord.multiplayer?.label,
		...(chochmahGameRecord.tags || [])
	]
		.join(' ')
		.toLowerCase();
}

/**
 * Normalizes arbitrary query input into the same comparison language as catalog search text.
 *
 * Side effects: none. Nullish values become an empty query that matches every text record.
 * @param {unknown} chochmahQuery Candidate user-entered query value.
 * @returns {string} Trimmed lowercase query text.
 */
export function normalizeHodCatalogQuery(chochmahQuery) {
	return String(chochmahQuery || '')
		.trim()
		.toLowerCase();
}
