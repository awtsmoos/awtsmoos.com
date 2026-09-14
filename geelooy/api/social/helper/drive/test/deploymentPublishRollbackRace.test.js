//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves publish and rollback cannot both mutate one observed production base.
 * @description
 * The Awtsmoos permits one finite winner beneath one site revision;
 * Awtsmoos.com verifies a simultaneous fresh publish and rollback serialize into
 * one success and one explicit stale-precondition rejection, never a lost update.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
	createDeployment,
	rollbackDeployment
} = require('../deploymentService.js');
const { mutateDriveState, readDriveState } = require('../stateRepository.js');

const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);
const HASH_C = 'c'.repeat(64);

async function isolated(run) {
	const previous = process.awtsmoosDbPath;
	const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'awts-publish-rollback-'));
	process.awtsmoosDbPath = root;
	try {
		await mutateDriveState('owner', {}, state => {
			state.sites.home = {
				id: 'home', title: 'Home', rootPath: 'sites/demo',
				enabled: true, primary: true, createdAt: 1, updatedAt: 1
			};
			state.entries['sites/demo/index.html'] = entry(HASH_A);
		});
		return await run();
	} finally {
		process.awtsmoosDbPath = previous;
		await fs.promises.rm(root, { recursive: true, force: true });
	}
}

function entry(objectHash) {
	return {
		path: 'sites/demo/index.html', type: 'file', objectHash,
		size: 7, mime: 'text/html', visibility: 'public',
		cachePolicy: 'mutable', createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z', trashedAt: null
	};
}

function publish(key, expectedDeploymentId) {
	return createDeployment({
		aliasId: 'owner', siteId: 'home', idempotencyKey: key,
		expectedDeploymentId, actorUserId: 'user-1', requestId: key
	});
}

test('concurrent publish and rollback allow exactly one production mutation', async () => {
	await isolated(async () => {
		const first = await publish('initial-a', null);
		await mutateDriveState('owner', {}, state => {
			state.entries['sites/demo/index.html'].objectHash = HASH_B;
		});
		const second = await publish('initial-b', first.deployment.id);
		await mutateDriveState('owner', {}, state => {
			state.entries['sites/demo/index.html'].objectHash = HASH_C;
		});
		const results = await Promise.allSettled([
			publish('concurrent-c', second.deployment.id),
			rollbackDeployment({
				aliasId: 'owner', siteId: 'home', deploymentId: first.deployment.id,
				expectedDeploymentId: second.deployment.id, actorUserId: 'user-1'
			})
		]);
		const fulfilled = results.filter(result => result.status === 'fulfilled');
		const rejected = results.filter(result => result.status === 'rejected');
		assert.equal(fulfilled.length, 1);
		assert.equal(rejected.length, 1);
		assert.equal(rejected[0].reason.code, 'DEPLOYMENT_PRECONDITION_FAILED');
		const state = await readDriveState('owner');
		assert.equal(state.sites.home.source.deploymentId, fulfilled[0].value.site.source.deploymentId);
	});
});
