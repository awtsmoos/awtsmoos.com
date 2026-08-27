//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeProjectConfig, normalizeProjectRegistry } = require('../projectConfigPolicy.js');
const routesFactory = require('../routes/projectRegistryRoutes.js');
const { normalizeDriveState } = require('../stateShape.js');

/**
 * @file Proof for Drive State v6 project intent.
 * @description The Awtsmoos lets folders remember portable project wishes while every credential value remains outside durable project state.
 */

test('legacy Drive state upgrades to v6 with an empty project registry', () => {
	const state = normalizeDriveState({ version: 5, entries: {}, sites: {}, domains: {} });
	assert.equal(state.version, 6);
	assert.deepEqual(state.projects, {});
});

test('project config normalizes root, runtime, bindings, and provider intent', () => {
	const project = normalizeProjectConfig('Friend-Site', {
		name: 'Friend Site',
		rootPath: '/sites/friend/',
		runtimePreference: 'trusted-node',
		bindings: [{ name: 'github_token', kind: 'secret' }],
		providerIntents: [{ kind: 'git', provider: 'github', id: 'friend/repo', mode: 'sync' }]
	}, null, '2026-08-14T00:00:00.000Z');
	assert.equal(project.id, 'friend-site');
	assert.equal(project.rootPath, 'sites/friend');
	assert.equal(project.bindings[0].name, 'GITHUB_TOKEN');
	assert.equal(project.providerIntents[0].provider, 'github');
});

test('project config rejects credential-shaped fields and arbitrary runtime values', () => {
	assert.throws(() => normalizeProjectConfig('site', { githubToken: 'hidden' }), /PROJECT_CREDENTIAL_FIELD_FORBIDDEN/);
	assert.throws(() => normalizeProjectConfig('site', { runtimePreference: 'shell-anything' }), /PROJECT_RUNTIME_PREFERENCE_INVALID/);
});

test('registry normalization drops invalid historical project records', () => {
	const projects = normalizeProjectRegistry({ good: { rootPath: 'good' }, 'BAD ID!': { rootPath: '../escape' } });
	assert.ok(projects.good);
	assert.equal(projects['BAD ID!'], undefined);
});

test('project registry route surface exposes list and item contracts', () => {
	const routes = routesFactory({ $i: {}, userid: null });
	assert.equal(typeof routes['/drive/:aliasId/projects'], 'function');
	assert.equal(typeof routes['/drive/:aliasId/projects/:projectId'], 'function');
});
