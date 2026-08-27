//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildDriveProjectPlan, normalizeRootPath } = require('../projectPlanService.js');
const projectPlanRoutes = require('../routes/projectPlanRoutes.js');

/**
 * @file Proof that backend Project Testimony v3 merges durable intent with live provider evidence without confusing them.
 * @description The Awtsmoos lets one server answer mirror Drive and OS while path confinement, runtime blocking, intent, evidence, and secret absence remain explicit.
 */

test('Drive plan returns registered configuration, intent, publication, and evidence separately', async () => {
	const plan = await buildDriveProjectPlan({
		aliasId: 'alpha',
		rootPath: 'sites/friend',
		actor: { actorType: 'owner' },
		$i: {},
		listSites: async () => [{ id: 'friend', rootPath: 'sites/friend' }],
		collectAttachments: async () => [{ kind: 'auth', provider: 'geelooy-session', state: 'ready', id: 'geelooy-session' }],
		findProject: async () => ({ id: 'friend', name: 'Friend', rootPath: 'sites/friend', runtimePreference: 'trusted-node', bindings: [], providerIntents: [{ kind: 'git', provider: 'github', id: 'friend/repo', mode: 'sync' }] })
	});
	assert.equal(plan.version, 3);
	assert.equal(plan.configuration.registered, true);
	assert.equal(plan.intent.runtimePreference, 'trusted-node');
	assert.equal(plan.intent.providers[0].kind, 'git');
	assert.equal(plan.attachments[0].kind, 'auth');
	assert.equal(plan.runtime.tenant.publicActivation, false);
});

test('unregistered folders still receive secret-free testimony with no invented intent', async () => {
	const plan = await buildDriveProjectPlan({
		aliasId: 'alpha', actor: { actorType: 'owner' }, $i: {},
		listSites: async () => [], collectAttachments: async () => [], findProject: async () => null
	});
	const serialized = JSON.stringify(plan).toLowerCase();
	assert.equal(plan.configuration.registered, false);
	assert.deepEqual(plan.intent.providers, []);
	assert.deepEqual(plan.bindings, []);
	assert.equal(serialized.includes('tokenvalue'), false);
});

test('root paths remain project-relative and traversal-free', () => {
	assert.equal(normalizeRootPath('sites/friend/'), 'sites/friend');
	assert.throws(() => normalizeRootPath('../other'), /PROJECT_ROOT_PATH_INVALID/);
	assert.throws(() => normalizeRootPath('/etc'), /PROJECT_ROOT_MUST_BE_RELATIVE/);
});

test('Drive router declares one read-only project testimony route', () => {
	const routes = projectPlanRoutes({ $i: {}, userid: null });
	assert.equal(typeof routes['/drive/:aliasId/project'], 'function');
});
