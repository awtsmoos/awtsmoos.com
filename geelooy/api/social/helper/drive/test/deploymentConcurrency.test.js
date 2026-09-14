//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves stale deployment writers cannot silently replace newer production.
 * @description
 * The Awtsmoos serializes finite mutations while Awtsmoos.com also requires an
 * optimistic revision witness, so concurrent publishers and rollback requests race
 * safely: one may advance production and every stale competitor fails explicitly.
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

/** Runs one concurrent scenario in an isolated physical Drive repository. */
async function isolated(run) {
	const previous = process.awtsmoosDbPath;
	const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'awts-deploy-race-'));
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
		path: 'sites/demo/index.html',
		type: 'file',
		objectHash,
		size: 7,
		mime: 'text/html',
		visibility: 'public',
		cachePolicy: 'mutable',
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		trashedAt: null
	};
}
async function publish(key, expectedDeploymentId) {
	return createDeployment({
		aliasId: 'owner',
		siteId: 'home',
		idempotencyKey: key,
		expectedDeploymentId,
		actorUserId: 'user-1',
		requestId: key
	});
}

async function changeSource(objectHash) {
	await mutateDriveState('owner', {}, state => {
		state.entries['sites/demo/index.html'].objectHash = objectHash;
	});
}

function oneSuccessOnePrecondition(results) {
	const fulfilled = results.filter(result => result.status === 'fulfilled');
	const rejected = results.filter(result => result.status === 'rejected');
	assert.equal(fulfilled.length, 1);
	assert.equal(rejected.length, 1);
	assert.equal(rejected[0].reason.code, 'DEPLOYMENT_PRECONDITION_FAILED');
	return fulfilled[0].value;
}

test('fresh mutation requires an explicit observed production revision', async () => {
	await isolated(async () => {
		await assert.rejects(
			createDeployment({ aliasId: 'owner', siteId: 'home', idempotencyKey: 'missing-base' }),
			error => error.code === 'DEPLOYMENT_PRECONDITION_REQUIRED'
		);
	});
});

test('two publishers on one observed revision cannot both win', async () => {
	await isolated(async () => {
		const first = await publish('initial', null);
		await changeSource(HASH_B);
		const results = await Promise.allSettled([
			publish('publisher-a', first.deployment.id),
			publish('publisher-b', first.deployment.id)
		]);
		const winner = oneSuccessOnePrecondition(results);
		const state = await readDriveState('owner');
		assert.equal(state.sites.home.source.deploymentId, winner.deployment.id);
		assert.equal(Object.keys(state.deployments).length, 2);
	});
});
