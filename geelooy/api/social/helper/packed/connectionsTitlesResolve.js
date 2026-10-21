//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module connectionsTitlesResolve
 * @description
 * Budgeted packed title resolution and title cache clearing.
 */

const { resolvePostRef } = require('./connectionsPosts.js');

const { titleCache, RESOLVE_BUDGET_MS, TITLE_CACHE_LIMIT, patternRef } = require('./connectionsTitlesPatterns.js');

/**
 * @description Resolves one post reference: instant pattern label, upgraded
 * to the real packed title when the lookup wins its time budget.
 * @param {Object} $i Active Awtsmoos request interface.
 * @param {string} postId Post identifier.
 * @returns {Promise<{post: string, postTitle: string, heichel: string|null, href: string|null}>} Reference.
 */
async function resolveTitle($i, postId) {
	const id = String(postId || '').trim();
	if (!id) return { post: id, postTitle: id, heichel: null, href: null };
	const hit = titleCache.get(id);
	if (hit) return hit;

	const fallback = patternRef(id);
	let winner = null;
	try {
		winner = await Promise.race([
			resolvePostRef($i, id),
			new Promise((resolve) => setTimeout(() => resolve(null), RESOLVE_BUDGET_MS))
		]);
	} catch (_) {
		winner = null;
	}
	// A packed "hit" that only echoes the postId back is not an upgrade.
	const upgraded = winner && winner.postTitle && winner.postTitle !== id ? winner : null;
	const out = upgraded || fallback;
	if (upgraded) {
		if (titleCache.size >= TITLE_CACHE_LIMIT) titleCache.delete(titleCache.keys().next().value);
		titleCache.set(id, out);
	}
	return out;
}

/** @description Clears the title cache (tests only). @returns {void} */
function clearTitleCache() {
	titleCache.clear();
}

module.exports = {
	resolveTitle,
	clearTitleCache
};
