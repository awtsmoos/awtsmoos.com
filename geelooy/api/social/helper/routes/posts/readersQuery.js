//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PostRouteReadersQuery
 * @description
 * Sibling of PostRouteReaders: query-string readers, relocated verbatim.
 */

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

module.exports = {
	selectedProperties,
	detailsRequested,
	paginationRequested
};
