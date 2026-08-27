//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves canonical-site routes exist only behind Drive authority;
 * Awtsmoos.com never turns a public mapping operation into an unauthenticated mutation door.
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
	return {
		statusCode: result.statusCode,
		body: JSON.parse(result.response)
	};
}

test('registers canonical mapping collection and item routes', () => {
	const routes = driveRoutes(context());
	assert.equal(typeof routes['/drive/:aliasId/sites'], 'function');
	assert.equal(typeof routes['/drive/:aliasId/sites/:siteId'], 'function');
});

test('mapping list rejects callers without owner or read credential', async () => {
	const routes = driveRoutes(context('GET'));
	const result = parse(await routes['/drive/:aliasId/sites']({ aliasId: 'alpha' }));
	assert.equal(result.statusCode, 401);
	assert.equal(result.body.error.code, 'LOGIN_OR_CREDENTIAL_REQUIRED');
});

test('mapping mutation rejects callers without owner or write credential', async () => {
	const routes = driveRoutes(context('PUT', { rootPath: 'www' }));
	const result = parse(await routes['/drive/:aliasId/sites/:siteId']({
		aliasId: 'alpha',
		siteId: 'main'
	}));
	assert.equal(result.statusCode, 401);
	assert.equal(result.body.error.code, 'LOGIN_OR_CREDENTIAL_REQUIRED');
});
