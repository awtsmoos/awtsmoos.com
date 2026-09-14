//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves preview deployments remain immutable and production-independent.
 * @description
 * The Awtsmoos lets source branch into private review testimony while production
 * keeps its exact active hash set; Awtsmoos.com guards history, retries, and
 * retention by deployment environment rather than mixing preview with rollback.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { createDeployment } = require('../deploymentCreate.js');
const { createPreviewDeployment } = require('../deploymentPreview.js');
const { listDeployments } = require('../deploymentQueries.js');
const { pruneDeployments } = require('../deploymentServiceSupport.js');
const { readDriveState } = require('../stateRepository.js');
const { upsertSiteMapping } = require('../siteMappingService.js');
const { writeDriveFile } = require('../writeService.js');

/** Writes one public website file through the real Drive object repository. */
function write($i, content) {
	return writeDriveFile({
		aliasId: 'alpha',
		path: 'sites/demo/index.html',
		content,
		visibility: 'public',
		actorUserId: 'tester',
		$i
	});
}
test('preview creation never moves the production deployment pointer', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-preview-state-');
	await write($i, 'PRODUCTION-A');
	await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'home',
		input: { title: 'Home', rootPath: 'sites/demo', enabled: true, primary: true },
		$i
	});
	const production = await createDeployment({
		aliasId: 'alpha',
		siteId: 'home',
		idempotencyKey: 'production-a',
		expectedDeploymentId: null,
		actorUserId: 'tester',
		$i
	});
	await write($i, 'PREVIEW-B');
	const preview = await createPreviewDeployment({
		aliasId: 'alpha',
		siteId: 'home',
		idempotencyKey: 'preview-b',
		actorUserId: 'tester',
		$i
	});
	const replay = await createPreviewDeployment({
		aliasId: 'alpha',
		siteId: 'home',
		idempotencyKey: 'preview-b',
		actorUserId: 'tester',
		$i
	});
	const state = await readDriveState('alpha', $i);
	assert.equal(preview.deployment.environment, 'preview');
	assert.equal(replay.replayed, true);
	assert.equal(replay.deployment.id, preview.deployment.id);
	assert.equal(state.sites.home.source.deploymentId, production.deployment.id);
	assert.equal((await listDeployments('alpha', 'home', $i)).length, 1);
	assert.equal((await listDeployments('alpha', 'home', $i, 'preview')).length, 1);
	assert.equal(state.events.filter(event => event.type === 'deployment.preview.create').length, 1);
});

test('preview retention prunes previews without deleting production history', () => {
	const state = { deployments: {} };
	state.deployments.production = {
		id: 'production',
		siteId: 'home',
		environment: 'production',
		createdAt: '2026-01-01T00:00:00.000Z'
	};
	for (let index = 0; index < 51; index += 1) {
		state.deployments[`preview-${index}`] = {
			id: `preview-${index}`,
			siteId: 'home',
			environment: 'preview',
			createdAt: new Date(Date.UTC(2026, 0, 2, 0, 0, index)).toISOString()
		};
	}
	pruneDeployments(state, 'home', 'preview');
	assert.ok(state.deployments.production);
	assert.equal(Object.values(state.deployments).filter(item => item.environment === 'preview').length, 50);
	assert.equal(state.deployments['preview-0'], undefined);
});
