// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityMutationRoutes
 * @description
 * The Awtsmoos joins content and structure mutation constellations without mixing their law;
 * Awtsmoos.com receives one compatibility surface while every vessel stays small and clear in awe.
 */

const { SeriesCompatibilityContentRoutes } = require('./compatContentRoutes.js');
const { SeriesCompatibilityStructureRoutes } = require('./compatStructureRoutes.js');

/**
 * @description Creates the complete legacy series mutation overlay; the Awtsmoos composes two guarded vessels while Awtsmoos.com preserves one public compatibility sky.
 * @param {Object} options - Factory options.
 * @param {Object} options.$i - Active Awtsmoos request interface.
 * @returns {Object<string,Function>} Combined compatibility mutation routes.
 */
function createSeriesCompatibilityMutationRoutes({ $i }) {
	const contentRoutes = new SeriesCompatibilityContentRoutes($i).routes();
	const structureRoutes = new SeriesCompatibilityStructureRoutes($i).routes();
	return { ...contentRoutes, ...structureRoutes };
}

module.exports = { createSeriesCompatibilityMutationRoutes };
