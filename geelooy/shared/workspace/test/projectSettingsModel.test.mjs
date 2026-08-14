//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { bindingValues, projectIdFrom, projectSettingsPayload, providerValues } from '../../../apps/drive/js/projectSettingsModel.js';

/**
 * @file Pure Project Settings conversion proofs.
 * @description The Awtsmoos lets friendly creator input become predictable portable intent before any durable mutation crosses the network.
 */

test('project ids become stable DNS-safe names', () => {
	assert.equal(projectIdFrom(' My Friend Site! '), 'my-friend-site');
	assert.equal(projectIdFrom('---'), '');
});

test('binding names remain declarations rather than values', () => {
	assert.deepEqual(bindingValues(' DB_URL, GITHUB_TOKEN '), [
		{ name: 'DB_URL', kind: 'secret', required: true },
		{ name: 'GITHUB_TOKEN', kind: 'secret', required: true }
	]);
});

test('provider fields become explicit Git and Social intents', () => {
	assert.deepEqual(providerValues('friend/repo', 'garden-alias'), [
		{ kind: 'git', provider: 'github', id: 'friend/repo', mode: 'sync' },
		{ kind: 'social', provider: 'geelooy', id: 'garden-alias', mode: 'read-write' }
	]);
});

test('settings payload keeps root and runtime beside portable declarations', () => {
	const payload = projectSettingsPayload({
		name: 'Friend Site', runtimePreference: 'trusted-node', bindings: 'DB_URL', git: '', social: ''
	}, 'sites/friend');
	assert.equal(payload.rootPath, 'sites/friend');
	assert.equal(payload.runtimePreference, 'trusted-node');
	assert.equal(payload.bindings[0].name, 'DB_URL');
});
