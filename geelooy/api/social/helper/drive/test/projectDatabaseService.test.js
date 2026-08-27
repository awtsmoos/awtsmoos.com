//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../projectDatabaseService.js');
const projectHostingRoutes = require('../routes/projectHostingRoutes.js');

/**
 * @file Tests for the bounded project database and route vessels.
 * @description The Awtsmoos proves one alias cannot spill into another while Awtsmoos.com keeps key reads and writes deliberately small.
 */

function fakeContext() {
	const calls = [];
	const db = new Proxy({}, {
		get: (_target, method) => (...args) => {
			calls.push([String(method), ...args]);
			if (method === 'getObjectKeys') return Promise.resolve(Array.from({ length: 7 }, (_, index) => `k${index}`));
			if (method === 'getObjectKey') return Promise.resolve({ ok: true });
			return Promise.resolve(true);
		}
	});
	return { calls, $i: { db } };
}

test('list results are bounded and owner scoped', async () => {
	const { calls, $i } = fakeContext();
	const result = await service.listProjectKeys({ $i, aliasId: 'alpha', projectId: 'site', limit: 3 });
	assert.equal(result.keys.length, 3);
	assert.equal(result.truncated, true);
	assert.match(calls[0][1], /^\/_projects\/owner-[a-f0-9]{24}\/site$/);
});

test('set and delete operate on a named safe key only', async () => {
	const { calls, $i } = fakeContext();
	await service.setProjectKey({ $i, aliasId: 'alpha', projectId: 'site', path: 'profiles', key: 'me', value: { name: 'A' } });
	await service.deleteProjectKey({ $i, aliasId: 'alpha', projectId: 'site', path: 'profiles', key: 'me' });
	assert.deepEqual(calls.map(call => call[0]), ['setObjectKey', 'deleteObjectKey']);
	assert.throws(() => service.normalizeDatabaseKey('../escape'), /INVALID_PROJECT_DB_KEY/);
});

test('oversized project values are rejected before database mutation', async () => {
	const { calls, $i } = fakeContext();
	await assert.rejects(
		service.setProjectKey({ $i, aliasId: 'alpha', projectId: 'site', key: 'big', value: 'x'.repeat(service.MAX_VALUE_BYTES + 1) }),
		error => error.statusCode === 413
	);
	assert.equal(calls.length, 0);
});

test('Drive router exposes hosting and database project routes', () => {
	const routes = projectHostingRoutes({ $i: {}, userid: null });
	assert.equal(typeof routes['/drive/:aliasId/projects/:projectId/hosting'], 'function');
	assert.equal(typeof routes['/drive/:aliasId/projects/:projectId/database'], 'function');
});
