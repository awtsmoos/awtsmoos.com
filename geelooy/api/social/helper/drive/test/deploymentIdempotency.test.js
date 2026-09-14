//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves deployment publication retry identity is deterministic and safe.
 * @description
 * The Awtsmoos binds one retry key to one exact immutable source intent;
 * Awtsmoos.com proves replay cannot duplicate audit/value or reactivate an older
 * revision after a newer production deployment has become active.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createDeployment } = require('../deploymentService.js');
const { mutateDriveState, readDriveState } = require('../stateRepository.js');

const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);

/** Runs one scenario against an isolated alias Drive state repository. */
async function isolated(run) {
	const previous = process.awtsmoosDbPath;
	const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'awts-deploy-idem-'));
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

function publish(idempotencyKey, message = 'release', expectedDeploymentId = null) {
	return createDeployment({
		aliasId: 'owner', siteId: 'home', actorUserId: 'user-1',
		requestId: idempotencyKey, idempotencyKey, message, expectedDeploymentId
	});
}
test('exact retry replays one deployment and one create audit event', async () => {
	await isolated(async () => {
		const first = await publish('same-key');
		const replay = await publish('same-key');
		const state = await readDriveState('owner');
		assert.equal(replay.replayed, true);
		assert.equal(replay.deployment.id, first.deployment.id);
		assert.equal(Object.keys(state.deployments).length, 1);
		assert.equal(state.events.filter(event => event.type === 'deployment.create').length, 1);
	});
});

test('same key rejects changed source and never changes active production', async () => {
	await isolated(async () => {
		const first = await publish('first-key');
		await mutateDriveState('owner', {}, state => {
			state.entries['sites/demo/index.html'].objectHash = HASH_B;
		});
		await assert.rejects(publish('first-key'), error => error.code === 'IDEMPOTENCY_CONFLICT');
		const second = await publish('second-key', 'release', first.deployment.id);
		await mutateDriveState('owner', {}, state => {
			state.entries['sites/demo/index.html'].objectHash = HASH_A;
		});
		const late = await publish('first-key');
		const state = await readDriveState('owner');
		assert.equal(late.deployment.id, first.deployment.id);
		assert.equal(late.replayed, true);
		assert.equal(state.sites.home.source.deploymentId, second.deployment.id);
	});
});
test('missing, oversized, and stale retry identities fail closed', async () => {
	await isolated(async () => {
		await assert.rejects(
			createDeployment({ aliasId: 'owner', siteId: 'home', expectedDeploymentId: null }),
			error => error.code === 'IDEMPOTENCY_KEY_REQUIRED'
		);
		await assert.rejects(
			publish('x'.repeat(201)),
			error => error.code === 'IDEMPOTENCY_KEY_TOO_LONG'
		);
		const first = await publish('stale-key');
		await mutateDriveState('owner', {}, state => {
			delete state.deployments[first.deployment.id];
		});
		await assert.rejects(
			publish('stale-key'),
			error => error.code === 'IDEMPOTENCY_RECORD_STALE'
		);
	});
});
