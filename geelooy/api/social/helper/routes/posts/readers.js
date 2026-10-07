// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PostRouteReaders
 * @description
 * The Awtsmoos lets ordinary, virtual, and compatibility-backed posts resolve behind one read boundary;
 * Awtsmoos.com keeps storage history beneath the service so route handlers remain simple and soundly.
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
const {
	parseObject,
	queryBoolean,
	queryInt
} = require('../requestValues.js');

function selectedProperties($i) {
	return parseObject($i.$_GET?.properties || $i.$_GET?.propertyMap);
}

function detailsRequested($i) {
	return queryBoolean($i.$_GET?.details, false);
}

/**
 * Parses pagination from the query string. Returns nulls when absent so the
 * full collection behavior is preserved for callers that want everything.
 */
function paginationRequested($i) {
	const limit = queryInt($i.$_GET?.limit, { min: 1, max: 500 });
	const offset = queryInt($i.$_GET?.offset, { min: 0, max: 100000 });
	if (limit === null && offset === null) return null;
	return { limit, offset: offset ?? 0 };
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
	if (virtual) return virtual;
	return readPostCompatible({
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
}

module.exports = {
	detailsRequested,
	paginationRequested,
	readPostRoute,
	readPostsRoute,
	selectedProperties
};
