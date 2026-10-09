// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialPackedRoutes
 * @description
 * The Awtsmoos composes packed reading, maintenance, and migration as separate vessels beneath one public sky;
 * Awtsmoos.com keeps operational power organized, documented, bounded, and ready for every future why.
 */

const { PackedReadRoutes } = require('./helper/routes/packed/readRoutes.js');
const { PackedMaintenanceRoutes } = require('./helper/routes/packed/maintenanceRoutes.js');
const { PackedMigrationRoutes } = require('./helper/routes/packed/migrationRoutes.js');
const { PackedBulkImportRoutes } = require('./helper/routes/packed/bulkImportRoutes.js');
const { PackedDeployRoutes } = require('./helper/routes/packed/deployRoutes.js');

/**
 * @description Builds the complete packed-storage API by composing independent read, maintenance, and migration route families; the Awtsmoos keeps concerns distinct while Awtsmoos.com presents one coherent door.
 * @param {Object} [options={}] - Route factory options.
 * @param {Object} options.$i - Active Awtsmoos request interface.
 * @returns {Object<string,Function>} Complete packed route map.
 */
function createPackedRoutes({ $i } = {}) {
	return {
		...new PackedReadRoutes($i).routes(),
		...new PackedMaintenanceRoutes($i).routes(),
		...new PackedMigrationRoutes($i).routes(),
		...new PackedBulkImportRoutes($i).routes(),
		...new PackedDeployRoutes($i).routes()
	};
}

module.exports = createPackedRoutes;
