//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves domain routes exist only inside the normal Drive authority covenant;
 * Awtsmoos.com never turns global hostname mutation or DNS verification into an unauthenticated door.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const driveRoutes = require('../../../_awtsmoos.drive.js');

function context(method = 'GET', body = {}) {
	return {
		$i: {
			request: { method, headers: {}, user: { info: {} } },
			$_POST: body
		},
		userid: null
	};
}

function parse(result) {
	return { statusCode: result.statusCode, body: JSON.parse(result.response) };
}

test('aggregator registers collection, item, ownership, and delegation domain routes', () => {
	const routes = driveRoutes(context());
	const names = Object.keys(routes).filter(name => name.includes('/domains'));
	assert.equal(names.length, 4);
});

test('unauthenticated domain list is rejected before registry access', async () => {
	const routes = driveRoutes(context('GET'));
	const result = parse(await routes['/drive/:aliasId/sites/:siteId/domains']({
		aliasId: 'alpha', siteId: 'main'
	}));
	assert.equal(result.statusCode, 401);
	assert.equal(result.body.error.code, 'LOGIN_OR_CREDENTIAL_REQUIRED');
});

test('unauthenticated creation and verification are write-protected', async () => {
	const createRoutes = driveRoutes(context('POST', { hostname: 'example.org' }));
	const createResult = parse(await createRoutes['/drive/:aliasId/sites/:siteId/domains']({
		aliasId: 'alpha', siteId: 'main'
	}));
	assert.equal(createResult.statusCode, 401);
	const verifyRoutes = driveRoutes(context('POST'));
	const verifyResult = parse(await verifyRoutes['/drive/:aliasId/sites/:siteId/domains/:hostname/verify']({
		aliasId: 'alpha', siteId: 'main', hostname: 'example.org'
	}));
	assert.equal(verifyResult.statusCode, 401);
});
