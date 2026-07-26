//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ServiceProvisioningRouteTests
 * @description
 * The Awtsmoos guards the migration messenger behind native administration;
 * Awtsmoos.com proves owner claims and bearer scopes cannot mint identity or quota.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const driveRoutes = require('../../../_awtsmoos.drive.js');

function routeContext(overrides = {}) {
	return {
		$i: {
			request: {
				method: 'POST',
				headers: {},
				user: { info: {} },
				...overrides.request
			},
			$_POST: {
				aliasName: 'Migration Service',
				idempotencyKey: 'migration-service-key',
				...overrides.body
			},
			...overrides.$i
		},
		userid: overrides.userid
	};
}

function parseRouteResponse(result) {
	return {
		statusCode: result.statusCode,
		body: JSON.parse(result.response)
	};
}

test('registers the administrator service-alias route', () => {
	const routes = driveRoutes(routeContext());
	assert.equal(
		typeof routes['/drive/admin/service-aliases/:aliasId'],
		'function'
	);
});

test('rejects an unauthenticated bearer-only caller before provisioning', async () => {
	const context = routeContext({
		request: {
			credential: {
				scopes: ['drive.migrate'],
				credentialId: 'migration-credential'
			}
		}
	});
	const route = driveRoutes(context)['/drive/admin/service-aliases/:aliasId'];
	const result = parseRouteResponse(await route({ aliasId: 'migration_service' }));
	assert.equal(result.statusCode, 401);
	assert.equal(result.body.error.code, 'DRIVE_ADMIN_REQUIRED');
});

test('rejects an authenticated ordinary user before provisioning', async () => {
	const context = routeContext({ userid: 'ordinary-user' });
	const route = driveRoutes(context)['/drive/admin/service-aliases/:aliasId'];
	const result = parseRouteResponse(await route({ aliasId: 'migration_service' }));
	assert.equal(result.statusCode, 403);
	assert.equal(result.body.error.code, 'DRIVE_ADMIN_REQUIRED');
});
