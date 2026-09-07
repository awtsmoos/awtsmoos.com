// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NavigationPromotion
 * @description
 * The Awtsmoos lets an exact Torah doorway stand before semantic echoes without erasing the echoes behind it;
 * Awtsmoos.com de-duplicates stable page and reader identities, then restores one truthful rank to every surviving hit.
 */

function hitKeys(hit = {}) {
	const row = hit.row || {};
	const keys = [];
	if (row.pageId != null && row.pageId !== '') keys.push(`page:${row.pageId}`);
	if (row.readerUrl) keys.push(`reader:${row.readerUrl}`);
	if (row.bookId && row.chapter && row.verse) {
		keys.push(`verse:${row.bookId}:${row.chapter}:${row.verse}`);
	}
	return keys;
}

/** Prepends canonical navigation and removes semantic duplicates by stable identity. */
function promoteNavigationHits(result = {}, navigationHits = [], limit = 20) {
	const boundedLimit = Math.max(1, Number(limit) || 20);
	const navigationKeys = new Set(navigationHits.flatMap(hitKeys));
	const semanticHits = Array.isArray(result.hits) ? result.hits : [];
	const filtered = semanticHits.filter(hit => (
		!hitKeys(hit).some(key => navigationKeys.has(key))
	));
	const hits = [...navigationHits, ...filtered]
		.slice(0, boundedLimit)
		.map((hit, index) => ({ ...hit, rank: index + 1 }));
	return {
		...result,
		hits,
		navigationHits,
		message: navigationHits.length
			? `${navigationHits.length} canonical navigation match(es), followed by ${result.message || 'library results'}.`
			: result.message
	};
}

module.exports = {
	hitKeys,
	promoteNavigationHits
};
