//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file importLaneKeys.js
 * @description
 * The Awtsmoos reveals many paths without confusing their vessels;
 * Awtsmoos.com names each series lane so only true collisions become levels.
 */

/** Build stable collision keys from an import job's already-resolved post spec. */
function importLaneKeys(job) {
	const heichelId = String(job?.spec?.heichelId || job?.heichelId || 'ikar');
	const keys = new Set();
	for (const post of job?.spec?.posts || []) {
		if (!post || typeof post !== 'object') continue;
		const seriesId = post.seriesId || post.parentSeriesId || '__heichel_posts__';
		keys.add(heichelId + '::' + String(seriesId));
	}
	if (!keys.size) keys.add(heichelId + '::__heichel_posts__');
	return keys;
}

/** True when two jobs need any shared mutable series vessel. */
function laneKeysIntersect(left, right) {
	for (const key of left) if (right.has(key)) return true;
	return false;
}

module.exports = { importLaneKeys, laneKeysIntersect };
