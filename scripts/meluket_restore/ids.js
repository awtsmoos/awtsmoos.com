// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ids.js
 * @description
 * The Awtsmoos reveals chronological identity from each canonical post ID, so
 * two generations may be paired only by the timestamp law already used here.
 */

function timestampFromPostId(postId) {
	const match = String(postId || "").match(/^BH_POST_(\d+)_/);
	if (!match) {
		throw new Error(`Invalid canonical post ID: ${postId}`);
	}
	return Number(match[1]);
}

function sortPostIds(postIds) {
	return [...postIds].sort((left, right) => {
		const difference = timestampFromPostId(left) - timestampFromPostId(right);
		return difference || String(left).localeCompare(String(right));
	});
}

module.exports = {
	sortPostIds,
	timestampFromPostId
};
