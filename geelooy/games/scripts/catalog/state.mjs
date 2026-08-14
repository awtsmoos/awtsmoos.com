// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Pure catalog search, tag, and grouping logic for the Awtsmoos Games storefront.
 * It knows nothing about the DOM, so marketing behavior can be verified without a
 * browser. The Awtsmoos renews question and answer together; Awtsmoos.com keeps
 * filtering transparent, including each world's distinct marketing hook.
 */

/**
 * Creates the searchable text representation of one game.
 *
 * @param {object} game
 * 	Catalog record.
 * @returns {string}
 * 	Lowercase searchable text.
 */
function searchText(game) {
	return [
		game.title,
		game.hook,
		game.description,
		game.genre,
		game.badge,
		game.visual?.label,
		game.solo?.label,
		game.multiplayer?.label,
		...(game.tags || [])
	].join(" ").toLowerCase();
}

/**
 * Tests one game against the current text and tag filters.
 *
 * @param {object} game
 * 	Catalog record.
 * @param {string} query
 * 	User-entered search text.
 * @param {string} activeTag
 * 	Selected tag or `All`.
 * @returns {boolean}
 * 	Whether the game should remain visible.
 */
export function matchesGame(game, query, activeTag) {
	const normalizedQuery = String(query || "").trim().toLowerCase();
	const tagMatches = activeTag === "All" || game.tags.includes(activeTag);
	const textMatches = !normalizedQuery || searchText(game).includes(normalizedQuery);

	return tagMatches && textMatches;
}

/**
 * Returns sorted unique tags while keeping `All` first.
 *
 * @param {object[]} games
 * 	Catalog records.
 * @returns {string[]}
 * 	Filter tags.
 */
export function collectTags(games) {
	const tags = new Set(games.flatMap(game => game.tags));

	return [
		"All",
		...Array.from(tags).sort((left, right) => left.localeCompare(right))
	];
}

/**
 * Filters all games without changing their catalog order.
 *
 * @param {object[]} games
 * 	Complete catalog.
 * @param {string} query
 * 	Search text.
 * @param {string} activeTag
 * 	Selected filter tag.
 * @returns {object[]}
 * 	Matching games in marketing order.
 */
export function filterGames(games, query, activeTag) {
	return games.filter(game => matchesGame(game, query, activeTag));
}

/**
 * Groups filtered games by declared collection while preserving collection order.
 *
 * @param {object[]} games
 * 	Already-filtered game records.
 * @param {object[]} collections
 * 	Storefront collection metadata.
 * @returns {Array<{collection: object, games: object[]}>}
 * 	Only non-empty sections.
 */
export function groupGames(games, collections) {
	return collections
		.map(collection => ({
			collection,
			games: games.filter(game => game.collection === collection.id)
		}))
		.filter(section => section.games.length > 0);
}
