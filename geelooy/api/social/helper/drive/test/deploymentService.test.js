//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves deployment publication and rollback mutate only revision pointers.
 * @description
 * The Awtsmoos joins source hashes, site identity, and audit testimony atomically;
 * Awtsmoos.com verifies creation, listing, exact manifest reads, rollback, and
 * failure behavior against the real Drive state repository in an isolated root.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
	createDeployment,
	getDeployment,
	listDeployments,
	rollbackDeployment
} = require('../deploymentService.js');
const { mutateDriveState, readDriveState } = require('../stateRepository.js');

const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);

/** Runs one test with an isolated physical Drive database root. */
async function isolated(run) {
	const previous = process.awtsmoosDbPath;
	const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'awts-deploy-'));
	process.awtsmoosDbPath = root;
	try {
		return await run();
	} finally {
		process.awtsmoosDbPath = previous;
		await fs.promises.rm(root, { recursive: true, force: true });
	}
}

/** Seeds one editable site with public source plus a private file. */
async function seed(aliasId = 'owner') {
	await mutateDriveState(aliasId, {}, state => {
		state.sites.home = {
			id: 'home',
			title: 'Home',
			rootPath: 'sites/demo',
			enabled: true,
			primary: true,
			createdAt: 1,
			updatedAt: 1
		};
		state.entries['sites/demo/index.html'] = entry(HASH_A, true);
		state.entries['sites/demo/app.js'] = entry(HASH_A, true);
		state.entries['sites/demo/secret.txt'] = entry(HASH_A, false);
	});
}

function entry(objectHash, publicEntry) {
	return {
		path: 'ignored',
		type: 'file',
		objectHash,
		size: 7,
		mime: 'text/plain',
		visibility: publicEntry ? 'public' : 'private',
		cachePolicy: 'mutable',
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		trashedAt: null
	};
}

test('publish, list, inspect, and rollback preserve immutable deployment testimony', async () => {
	await isolated(async () => {
		await seed();
		const first = await createDeployment({
			aliasId: 'owner', siteId: 'home', actorUserId: 'user-1', requestId: 'publish-1', idempotencyKey: 'publish-1', expectedDeploymentId: null
		});
		assert.equal(first.deployment.fileCount, 2);
		assert.equal(first.event.type, 'deployment.create');
		const exact = await getDeployment('owner', 'home', first.deployment.id);
		assert.deepEqual(Object.keys(exact.files).sort(), ['app.js', 'index.html']);
		assert.equal(await getDeployment('owner', 'other', first.deployment.id), null);
		await mutateDriveState('owner', {}, state => {
			state.entries['sites/demo/index.html'].objectHash = HASH_B;
		});
		const second = await createDeployment({
			aliasId: 'owner', siteId: 'home', actorUserId: 'user-1', requestId: 'publish-2', idempotencyKey: 'publish-2', expectedDeploymentId: first.deployment.id
		});
		const history = await listDeployments('owner', 'home');
		assert.equal(history.length, 2);
		assert.equal(history[0].id, second.deployment.id);
		const rollback = await rollbackDeployment({
			aliasId: 'owner', siteId: 'home', deploymentId: first.deployment.id,
			actorUserId: 'user-1', requestId: 'rollback-1', expectedDeploymentId: second.deployment.id
		});
		assert.equal(rollback.event.type, 'deployment.rollback');
		assert.equal(rollback.site.source.deploymentId, first.deployment.id);
		const state = await readDriveState('owner');
		assert.equal(state.events.at(-1).type, 'deployment.rollback');
		assert.equal(state.entries['sites/demo/index.html'].objectHash, HASH_B);
	});
});

test('publish fails closed when the editable source has no public index', async () => {
	await isolated(async () => {
		await seed();
		await mutateDriveState('owner', {}, state => {
			state.entries['sites/demo/index.html'].visibility = 'private';
		});
		await assert.rejects(
			createDeployment({ aliasId: 'owner', siteId: 'home', idempotencyKey: 'missing-index', expectedDeploymentId: null }),
			error => error.code === 'DEPLOYMENT_ENTRY_MISSING'
		);
	});
});
