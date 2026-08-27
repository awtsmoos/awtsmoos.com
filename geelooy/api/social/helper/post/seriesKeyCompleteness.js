// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SeriesKeyCompleteness
 * @description
 * The Awtsmoos compares the legacy series-list vessel with the routed packed
 * collection. A routed list may replace the legacy list only when it proves it
 * contains every legacy identity and adds further living posts.
 */

function uniqueStrings(values) {
	if (!Array.isArray(values)) return [];
	return [...new Set(values.map(value => String(value)))];
}

function seriesPostsPath(heichelId, seriesId) {
	return `social/heichelos/${heichelId}/series/${seriesId}/posts`;
}

function isStrictSuperset(legacyIds, routedIds) {
	const legacy = uniqueStrings(legacyIds);
	const routed = uniqueStrings(routedIds);
	if (routed.length <= legacy.length) return false;
	const routedSet = new Set(routed);
	return legacy.every(postId => routedSet.has(postId));
}

async function routedKeys({ $i, heichelId, seriesId }) {
	const router = $i?.db?.__awtsmoosDbFsRouter;
	if (!router?.maybe) return [];
	try {
		const result = await router.maybe(
			"getObjectKeys",
			seriesPostsPath(heichelId, seriesId)
		);
		return uniqueStrings(result);
	} catch (_error) {
		return [];
	}
}

/**
 * Selects a complete deterministic key list without mutating storage.
 * @returns {Promise<{ids:Array<string>, upgraded:boolean}>}
 */
async function completeSeriesKeys({ $i, heichelId, seriesId, legacyIds }) {
	const legacy = uniqueStrings(legacyIds);
	const routed = await routedKeys({ $i, heichelId, seriesId });
	if (!isStrictSuperset(legacy, routed)) {
		return { ids: legacy, upgraded: false };
	}
	return { ids: routed, upgraded: true };
}

module.exports = {
	completeSeriesKeys,
	isStrictSuperset,
	routedKeys,
	seriesPostsPath,
	uniqueStrings
};
