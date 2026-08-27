//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file credentialRoutes.test.js
 * @description
 * The Awtsmoos tests route-level denial where a service messenger approaches
 * identity or quota authority. Awtsmoos.com permits only its declared drive work.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { provisionDriveCredential } = require('../credentialProvisioning.js');
const { SERVICE_QUOTA } = require('../quotaPolicy.js');
const entryRoutes = require('../routes/entryRoutes.js');
const credentialRoutes = require('../routes/credentialRoutes.js');
const quotaRoutes = require('../routes/quotaRoutes.js');

async function tokenFor($i, scopes, id) {
	const result = await provisionDriveCredential({
		aliasId: 'alpha',
		ownerUserId: 'owner-1',
		name: `Service ${id}`,
		scopes,
		idempotencyKey: `credential-route-${id}`,
		$i
	});
	return result.token;
}

function requestContext(root, method, token, body = {}) {
	return {
		db: { directory: root },
		request: {
			method,
			headers: token ? { authorization: `Bearer ${token}` } : {},
			user: {}
		},
		$_GET: {},
		$_POST: method === 'POST' ? body : {},
		$_PUT: method === 'PUT' ? body : {},
		$_DELETE: method === 'DELETE' ? body : {}
	};
}

function errorCode(result) {
	return JSON.parse(result.response).error.code;
}

test('read-only credentials cannot write or publish', async t => {
	const { root, $i } = createDriveTestContext(t, 'awtsmoos-drive-route-read-');
	const token = await tokenFor($i, ['drive.read'], 'read-only');
	const writeRequest = requestContext(root, 'PUT', token, { text: 'blocked' });
	const writeHandler = entryRoutes({ $i: writeRequest, userid: null })
		['/drive/:aliasId/entry/:path*'];
	const writeResult = await writeHandler({ aliasId: 'alpha', path: 'blocked.txt' });
	assert.equal(writeResult.statusCode, 403);
	assert.equal(errorCode(writeResult), 'CREDENTIAL_SCOPE_REQUIRED');
	const publishRequest = requestContext(root, 'PUT', token, {
		text: 'blocked',
		visibility: 'public'
	});
	const publishHandler = entryRoutes({ $i: publishRequest, userid: null })
		['/drive/:aliasId/entry/:path*'];
	const publishResult = await publishHandler({ aliasId: 'alpha', path: 'public.txt' });
	assert.equal(publishResult.statusCode, 403);
});

test('write-only credentials write privately but need public scope to publish', async t => {
	const { root, $i } = createDriveTestContext(t, 'awtsmoos-drive-route-write-');
	const token = await tokenFor($i, ['drive.write'], 'write-only');
	const privateRequest = requestContext(root, 'PUT', token, { text: 'allowed' });
	const privateResult = await entryRoutes({ $i: privateRequest, userid: null })
		['/drive/:aliasId/entry/:path*']({ aliasId: 'alpha', path: 'allowed.txt' });
	assert.equal(privateResult.entry.visibility, 'private');
	const publicRequest = requestContext(root, 'PUT', token, {
		text: 'blocked',
		visibility: 'public'
	});
	const publicResult = await entryRoutes({ $i: publicRequest, userid: null })
		['/drive/:aliasId/entry/:path*']({ aliasId: 'alpha', path: 'blocked.txt' });
	assert.equal(publicResult.statusCode, 403);
});

test('service credentials cannot manage credentials or assign quota', async t => {
	const { root, $i } = createDriveTestContext(t, 'awtsmoos-drive-route-admin-');
	const token = await tokenFor($i, ['drive.migrate'], 'migration');
	const credentialRequest = requestContext(root, 'POST', token, {
		name: 'Escalated',
		scopes: ['drive.migrate'],
		idempotencyKey: 'forbidden-escalation'
	});
	const credentialResult = await credentialRoutes({ $i: credentialRequest, userid: null })
		['/drive/:aliasId/credentials']({ aliasId: 'alpha' });
	assert.equal(credentialResult.statusCode, 401);
	assert.equal(errorCode(credentialResult), 'LOGIN_REQUIRED');
	const quotaRequest = requestContext(root, 'POST', token, { profile: 'service-migration' });
	const quotaResult = await quotaRoutes({ $i: quotaRequest, userid: null })
		['/drive/:aliasId/admin/quota']({ aliasId: 'alpha' });
	assert.equal(quotaResult.statusCode, 401);
	assert.equal(errorCode(quotaResult), 'DRIVE_ADMIN_REQUIRED');
});

test('explicit admin assigns the exact migration service quota', async t => {
	const { root } = createDriveTestContext(t, 'awtsmoos-drive-route-quota-');
	const $i = requestContext(root, 'POST', null, { profile: 'service-migration' });
	$i.request.user.info = { userId: 'admin-1', isAdmin: true };
	const result = await quotaRoutes({ $i, userid: 'admin-1' })
		['/drive/:aliasId/admin/quota']({ aliasId: 'alpha' });
	assert.equal(result.quotaProfile, 'service-migration');
	assert.equal(result.quota.storageBytes, SERVICE_QUOTA.storageBytes);
	assert.equal(result.quota.monthlyEgressBytes, SERVICE_QUOTA.monthlyEgressBytes);
	assert.equal(result.quota.storageBytes, 2 * 1024 * 1024 * 1024);
	assert.equal(result.quota.monthlyEgressBytes, 2 * 1024 * 1024 * 1024);
});
