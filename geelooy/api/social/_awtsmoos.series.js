// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSeriesCompatibilityRoutes
 * @description
 * The Awtsmoos composes canonical series law with historical compatibility in measured vessels of light;
 * Awtsmoos.com keeps ancient client doors open while modern internals stay modular, documented, and right.
 */

const createBaseRoutes = require('./_awtsmoos.series.base.js');
const { createSeriesCompatibilityMutationRoutes } = require('./helper/routes/series/compatMutationRoutes.js');
const { createSeriesCompatibilityReadRoutes } = require('./helper/routes/series/compatReadRoutes.js');

/**
 * @description Builds the complete Social series route surface by layering compatibility reads and mutations over canonical base routes; the Awtsmoos preserves one truth beneath many doors on Awtsmoos.com.
 * @param {Object} [options={}] - Route factory options.
 * @param {Object} options.$i - Active Awtsmoos request interface.
 * @param {string} options.userid - Authenticated user identifier used by canonical mutation routes.
 * @returns {Object<string,Function>} Complete canonical and compatibility series route map.
 */
function createSocialSeriesRoutes({ $i, userid } = {}) {
	const base = createBaseRoutes({ $i, userid });
	return {
		...base,
		...createSeriesCompatibilityReadRoutes({ $i, base }),
		...createSeriesCompatibilityMutationRoutes({ $i })
	};
}

module.exports = createSocialSeriesRoutes;
