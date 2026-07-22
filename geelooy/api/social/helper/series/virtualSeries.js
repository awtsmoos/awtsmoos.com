// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file virtualSeries.js
 * @description
 * The virtual window joins canonical membership with canonical full posts.
 * Metadata and hydration remain separate vessels so each module stays small,
 * testable, and unable to counterfeit ownership.
 */

const {
	getAlternateGroups,
	isVirtualSeries,
	referencedSeriesIds
} = require("./virtualSeriesMeta.js");
const {
	decoratePost,
	readCanonicalPost,
	readCanonicalPosts
} = require("./virtualSeriesPosts.js");

async function getVirtualPostsInSeries({
	$i,
	heichelId,
	seriesId,
	withDetails = false,
	properties
}) {
	const prateem = await isVirtualSeries({ $i, heichelId, seriesId });
	if (!prateem) return null;
	const references = await referencedSeriesIds(
		$i,
		heichelId,
		seriesId,
		prateem
	);
	const output = [];
	for (const actualSeriesId of references) {
		const posts = await readCanonicalPosts({
			$i,
			heichelId,
			seriesId: actualSeriesId,
			withDetails,
			properties
		});
		for (const post of posts) {
			output.push(withDetails
				? { ...post, virtualSeriesId: seriesId }
				: post.postId || post.id
			);
		}
	}
	return output;
}

async function getVirtualPostFromSeries({
	$i,
	heichelId,
	seriesId,
	postId,
	properties
}) {
	const prateem = await isVirtualSeries({ $i, heichelId, seriesId });
	if (!prateem) return null;
	const references = await referencedSeriesIds(
		$i,
		heichelId,
		seriesId,
		prateem
	);
	for (const actualSeriesId of references) {
		const post = await readCanonicalPost({
			$i,
			heichelId,
			seriesId: actualSeriesId,
			postId,
			properties
		});
		if (post) {
			return decoratePost(postId, post, actualSeriesId, seriesId);
		}
	}
	return null;
}

module.exports = {
	getAlternateGroups,
	getVirtualPostFromSeries,
	getVirtualPostsInSeries,
	isVirtualSeries
};
