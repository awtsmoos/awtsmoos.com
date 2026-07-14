// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSearchRoutes
 * @description
 * Exact words, readable library text, local vectors, and comment windows meet in
 * one small registry while each route family keeps its own implementation vessel.
 */

const { exactRoutes } = require('./helper/search/routes/exact.js');
const { libraryRoutes } = require('./helper/search/routes/library.js');
const { commentRoutes } = require('./helper/search/routes/comments.js');

module.exports = ({ $i } = {}) => ({
	...exactRoutes($i),
	...libraryRoutes($i),
	...commentRoutes($i)
});
