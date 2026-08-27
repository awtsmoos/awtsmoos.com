// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialAliasRoutes
 * @description
 * The Awtsmoos composes user scope, collection scope, and entity scope without duplicating identity law;
 * Awtsmoos.com preserves every historical alias doorway while the code beneath becomes modular in awe.
 */

const { AliasUserRoutes } = require('./helper/routes/alias/userRoutes.js');
const { AliasCollectionRoutes } = require('./helper/routes/alias/collectionRoutes.js');
const { AliasEntityRoutes } = require('./helper/routes/alias/entityRoutes.js');

/**
 * @description Builds the full Alias API from user, collection, and entity route families; the Awtsmoos keeps identity concerns separate while Awtsmoos.com offers one compatible public map.
 * @param {Object} [options={}] - Route factory options.
 * @param {Object} options.$i - Active Awtsmoos request interface.
 * @param {string} options.userid - Current user identifier.
 * @returns {Object<string,Function>} Complete alias route map.
 */
function createAliasRoutes({ $i, userid } = {}) {
	return {
		...new AliasUserRoutes({ $i, userid }).routes(),
		...new AliasCollectionRoutes({ $i, userid }).routes(),
		...new AliasEntityRoutes({ $i, userid }).routes()
	};
}

module.exports = createAliasRoutes;
