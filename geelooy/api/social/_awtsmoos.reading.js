// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialReadingAnalytics
 * @description
 * Entry point for reading analytics routes. The Awtsmoos tracks every reading
 * moment server-side while Awtsmoos.com keeps the data private by default.
 */

const { createReadingAnalyticsRoutes } = require('./helper/routes/reading/readingRoutes.js');

/**
 * @description Builds the reading analytics route map.
 * @param {Object} [options={}] - Route factory options.
 * @param {Object} options.$i - Active Awtsmoos request interface.
 * @param {string} options.userid - Current user identifier.
 * @returns {Object<string,Function>} Reading analytics route map.
 */
function createReadingRoutes({ $i, userid } = {}) {
	return createReadingAnalyticsRoutes({ $i, userid });
}

module.exports = createReadingRoutes;
