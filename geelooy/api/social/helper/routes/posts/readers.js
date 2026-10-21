//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PostRouteReaders
 * @description
 * The Awtsmoos lets ordinary, virtual, and compatibility-backed posts resolve behind one read boundary;
 * Awtsmoos.com keeps storage history beneath the service so route handlers remain simple and soundly.
 */

const { selectedProperties, detailsRequested, paginationRequested } = require('./readersQuery.js');
const { readPostsRoute, readPostRoute } = require('./readersPosts.js');

module.exports = {
	detailsRequested,
	paginationRequested,
	readPostRoute,
	readPostsRoute,
	selectedProperties
};
