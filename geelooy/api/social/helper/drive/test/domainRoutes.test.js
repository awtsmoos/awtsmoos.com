//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves domain routes inherit Drive scopes instead of inventing power. */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { provisionDriveCredential } = require('../credentialProvisioning.js');
const domainRoutes = require('../routes/domainRoutes.js');

async function tokenFor($i, scopes, id) {
	const result = await provisionDriveCredential({
		aliasId: 'alpha',
		ownerUserId: 'owner-1',
		name: `Domain ${id}`,
		scopes,
		idempotencyKey: `domain-route-${id}`,
		$i
	});
	return result.token;
}

function request(root, method, token, body = {}, resolver) {
	return {
		db: { directory: root },
		request: {
			method,
			headers: { authorization: `Bearer ${token}` },
			user: {}
		},
		$_GET: {},
		$_POST: {},
		$_PUT: method === 'PUT' ? body : {},
		$_DELETE: {},
		domainResolver: resolver
	};
}

function errorCode(result) {
	return JSON.parse(result.response).error.code;
}

test('read scope lists domains but cannot claim one', async t => {
	const { root, $i } = createDriveTestContext(t, 'awtsmoos-domain-route-read-');
	const token = await tokenFor($i, ['drive.read'], 'read');
	const list = domainRoutes({ $i: request(root, 'GET', token), userid: null })
		['/drive/:aliasId/domains'];
	assert.deepEqual((await list({ aliasId: 'alpha' })).domains, []);
	const put = domainRoutes({
		$i: request(root, 'PUT', token, { mode: 'external-dns' }),
		userid: null
	})['/drive/:aliasId/sites/:siteId/domains/:hostname'];
	const denied = await put({ aliasId: 'alpha', siteId: 'home', hostname: 'scope.example' });
	assert.equal(denied.statusCode, 403);
	assert.equal(errorCode(denied), 'CREDENTIAL_SCOPE_REQUIRED');
});

test('write scope claims a domain and read scope can inspect it', async t => {
	const { root, $i } = createDriveTestContext(t, 'awtsmoos-domain-route-write-');
	const writeToken = await tokenFor($i, ['drive.write'], 'write');
	const put = domainRoutes({
		$i: request(root, 'PUT', writeToken, { mode: 'external-dns' }),
		userid: null
	})['/drive/:aliasId/sites/:siteId/domains/:hostname'];
	const created = await put({ aliasId: 'alpha', siteId: 'home', hostname: 'route.example' });
	assert.equal(created.domain.hostname, 'route.example');
	const readToken = await tokenFor($i, ['drive.read'], 'inspect');
	const get = domainRoutes({ $i: request(root, 'GET', readToken), userid: null })
		['/drive/:aliasId/domains/:hostname'];
	const inspected = await get({ aliasId: 'alpha', hostname: 'route.example' });
	assert.equal(inspected.domain.canonicalSiteUrl, '/sites/alpha/home/');
});
