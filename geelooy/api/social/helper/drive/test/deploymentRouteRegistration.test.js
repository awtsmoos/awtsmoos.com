//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves immutable deployment management remains reachable through Social Drive.
 * @description
 * The Awtsmoos joins route and service while Awtsmoos.com keeps publication behind
 * one composed authenticated API crown; this test prevents a future route refactor
 * from silently removing publish, revision read, or rollback doorways.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const createDriveRoutes = require('../../../_awtsmoos.drive.js');

const DEPLOYMENT_PATHS = Object.freeze([
	'/drive/:aliasId/sites/:siteId/deployments',
	'/drive/:aliasId/sites/:siteId/deployments/:deploymentId',
	'/drive/:aliasId/sites/:siteId/deployments/:deploymentId/rollback'
]);

/** Creates the minimum request vessel needed for route composition. */
function routeVessel() {
	return {
		$i: {
			request: {
				method: 'GET',
				headers: {}
			}
		},
		userid: 'route-registration-user'
	};
}

/** Verifies every immutable deployment doorway remains present after composition. */
test('Drive route crown includes deployment management routes', () => {
	const routes = createDriveRoutes(routeVessel());
	for (const path of DEPLOYMENT_PATHS) {
		assert.equal(typeof routes[path], 'function', `missing route: ${path}`);
	}
});
