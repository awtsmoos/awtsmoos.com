//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PostRouteReadersPosts
 * @description
 * Sibling of PostRouteReaders: post read routes and payload strip, relocated verbatim.
 */

const {
	getPostFromSeries,
	getPostsInSeries
} = require('../../index.js');
const {
	readPostCompatible,
	readPostsCompatible
} = require('../../post/seriesReadCompatibility.js');
const {
	getVirtualPostFromSeries,
	getVirtualPostsInSeries
} = require('../../series/virtualSeries.js');

const { detailsRequested, paginationRequested, selectedProperties } = require('./readersQuery.js');

// B"H — Yaakov 2026-10-15: Strip unused payload to make post API lightning fast.
// `source.sections` (111KB, 42% of payload) is never used by the frontend
// (only `source.hebrew` is referenced). Removing it saves 42% bandwidth.
function stripUnusedPostPayload(result) {
	if (!result) return result;
	// The post may be the top-level object or nested under .post
	const post = result.post || result;
	if (post.source && post.source.sections) {
		delete post.source.sections;
	}
	return result;
}

async function readPostsRoute({
	$i,
	heichelId,
	seriesId,
	withDetails = detailsRequested($i)
}) {
	const properties = selectedProperties($i);
	const pagination = paginationRequested($i);
	const virtual = await getVirtualPostsInSeries({
		$i,
		heichelId,
		seriesId,
		withDetails,
		properties,
		pagination
	});
	if (virtual) return virtual;
	return readPostsCompatible({
		$i,
		heichelId,
		seriesId,
		withDetails,
		properties,
		pagination,
		postReader: postId => getPostFromSeries({
			$i,
			heichelId,
			seriesId,
			postId
		}),
		standardReader: () => getPostsInSeries({
			$i,
			heichelId,
			seriesId,
			withDetails,
			properties,
			pagination
		})
	});
}

async function readPostRoute({
	$i,
	heichelId,
	seriesId,
	postId
}) {
	const properties = selectedProperties($i);
	const virtual = await getVirtualPostFromSeries({
		$i,
		heichelId,
		seriesId,
		postId,
		properties
	});
	if (virtual) return stripUnusedPostPayload(virtual);
	const result = await readPostCompatible({
		$i,
		heichelId,
		seriesId,
		postId,
		properties,
		standardReader: () => getPostFromSeries({
			$i,
			heichelId,
			seriesId,
			postId
		})
	});
	return stripUnusedPostPayload(result);
}

module.exports = {
	readPostsRoute,
	readPostRoute,
	stripUnusedPostPayload
};
