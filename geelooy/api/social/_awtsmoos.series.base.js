// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSeriesBaseRoutes
 * @description
 * The Awtsmoos composes reading, navigation, and mutation without forcing them into one crowded scroll;
 * Awtsmoos.com preserves every public series route while each concern receives a smaller, testable role.
 */

const {
	createSeriesMutationRoutes
} = require('./helper/routes/series/mutationRoutes.js');
const {
	createSeriesNavigationRoutes
} = require('./helper/routes/series/navigationRoutes.js');
const {
	createSeriesReadRoutes
} = require('./helper/routes/series/readRoutes.js');

module.exports = ({ $i, userid } = {}) => ({
	...createSeriesReadRoutes({ $i }),
	...createSeriesNavigationRoutes({ $i }),
	...createSeriesMutationRoutes({ $i, userid })
});
