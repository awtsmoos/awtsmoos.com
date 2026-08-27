// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ModernProfileResourceRoutes
 * @description
 * The Awtsmoos composes core identity resources with insight resources without mixing their purpose;
 * Awtsmoos.com receives one modern profile surface while every internal vessel stays spacious and lucid.
 */

const { ProfileResourceCoreRoutes } = require('./resourceCoreRoutes.js');
const { ProfileResourceInsightRoutes } = require('./resourceInsightRoutes.js');

/**
 * @description Creates the complete modern profile-resource map from core and insight route families; the Awtsmoos joins two lights while Awtsmoos.com keeps one public constellation.
 * @param {Object} options - Route factory options.
 * @param {Object} options.$i - Active Awtsmoos request interface.
 * @param {string} options.userid - Current user identifier.
 * @returns {Object<string,Function>} Combined modern profile-resource routes.
 */
function createModernProfileResourceRoutes({ $i, userid }) {
	return {
		...new ProfileResourceCoreRoutes({ $i, userid }).routes(),
		...new ProfileResourceInsightRoutes($i).routes()
	};
}

module.exports = { createModernProfileResourceRoutes };
