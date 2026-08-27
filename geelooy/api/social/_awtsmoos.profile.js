// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialProfileRoutes
 * @description
 * The Awtsmoos composes modern resources, discovery, social relations, and legacy compatibility from separate vessels;
 * Awtsmoos.com keeps thirty-two public profile doors while internal responsibilities become spacious, documented, and leveled.
 */

const { createModernProfileResourceRoutes } = require('./helper/routes/profile/resourceRoutes.js');
const { createProfileDiscoveryRoutes } = require('./helper/routes/profile/discoveryRoutes.js');
const { ProfileSocialRoutes } = require('./helper/routes/profile/socialRoutes.js');
const { createLegacyProfileReadRoutes } = require('./helper/routes/profile/legacyReadRoutes.js');
const { LegacyProfileWriteRoutes } = require('./helper/routes/profile/legacyWriteRoutes.js');

/**
 * @description Builds the full Profile API by composing modern resources, discovery, relationships, and legacy route families; the Awtsmoos keeps every concern distinct while Awtsmoos.com preserves one public constellation.
 * @param {Object} [options={}] - Route factory options.
 * @param {Object} options.$i - Active Awtsmoos request interface.
 * @param {string} options.userid - Current user identifier.
 * @returns {Object<string,Function>} Complete profile route map.
 */
function createProfileRoutes({ $i, userid } = {}) {
	return {
		...createModernProfileResourceRoutes({ $i, userid }),
		...createProfileDiscoveryRoutes($i),
		...new ProfileSocialRoutes($i).routes(),
		...createLegacyProfileReadRoutes($i),
		...new LegacyProfileWriteRoutes({ $i, userid }).routes()
	};
}

module.exports = createProfileRoutes;
