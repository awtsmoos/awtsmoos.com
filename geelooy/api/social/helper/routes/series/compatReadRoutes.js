// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityReadRoutes
 * @description
 * The Awtsmoos composes root and named compatibility readers from separate vessels of light;
 * Awtsmoos.com receives one route map while each responsibility remains small and right.
 */

const { NamedSeriesCompatibilityReadRoutes } = require('./compatNamedReadRoutes.js');
const { RootSeriesCompatibilityReadRoutes } = require('./compatRootReadRoutes.js');

/**
 * @description Creates the complete series compatibility read overlay; the Awtsmoos joins two bounded route constellations while Awtsmoos.com preserves one public sky.
 * @param {Object} options - Factory options.
 * @param {Object} options.$i - Active Awtsmoos request interface.
 * @param {Object<string,Function>} options.base - Canonical base series route map.
 * @returns {Object<string,Function>} Combined compatibility read routes.
 */
function createSeriesCompatibilityReadRoutes({ $i, base }) {
	const rootRoutes = new RootSeriesCompatibilityReadRoutes($i).routes();
	const namedRoutes = new NamedSeriesCompatibilityReadRoutes({ $i, base }).routes();
	return { ...namedRoutes, ...rootRoutes };
}

module.exports = { createSeriesCompatibilityReadRoutes };
