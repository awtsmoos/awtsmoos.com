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
const { memoizedRead, peekMemoizedRead } = require('../../profile/readCache.js');

/**
 * B"H 2026-11-20 (ikar series load fix): one canonical cache key for a
 * series post-list read, shared by the memoized reader below and by the
 * route's shed gate (which peeks for a warm answer before refusing).
 */
function seriesPostsCacheKey({ heichelId, seriesId, withDetails, properties, pagination }) {
	return [
		'seriesPosts',
		String(heichelId),
		String(seriesId),
		withDetails ? 'details' : 'ids',
		properties ? JSON.stringify(properties) : '',
		pagination ? `${pagination.offset || 0}:${pagination.limit ?? ''}` : ''
	].join('|');
}

/** Carries a non-list route result out of the memo producer uncached. */
class UncachedResult extends Error {
	constructor(result) {
		super('series posts read returned a non-list result');
		this.result = result;
	}
}

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
	// B"H 2026-11-20: the unmemoized read walks every post record in the
	// series (imported corpora carry ~0.5MB per record) on EVERY request,
	// and the read shed refuses the route outright whenever the heap is
	// hot -- so series pages sat on a silent void. Memoize the finished
	// list (45s, in-flight coalesced, failures never cached -- the house
	// profile readCache), so repeat views are served from memory even
	// while the shed is closed.
	const key = seriesPostsCacheKey({ heichelId, seriesId, withDetails, properties, pagination });
	try {
		return await memoizedRead(key, async () => {
			const result = await readPostsRouteUncached({ $i, heichelId, seriesId, withDetails, properties, pagination });
			if (!Array.isArray(result)) throw new UncachedResult(result);
			return result;
		});
	} catch (error) {
		if (error instanceof UncachedResult) return error.result;
		throw error;
	}
}

async function readPostsRouteUncached({
	$i,
	heichelId,
	seriesId,
	withDetails,
	properties,
	pagination
}) {
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
