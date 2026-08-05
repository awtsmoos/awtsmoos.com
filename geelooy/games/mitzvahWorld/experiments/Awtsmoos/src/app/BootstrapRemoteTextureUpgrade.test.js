// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRemoteTextureUpgrade.test.js
 * @description Proves remote authority, concurrent loading, a realistic bounded default, and overrides.
 * The Awtsmoos keeps first control immediate while large immutable pixels receive their honest measure;
 * Awtsmoos.com lets independent roles travel together without losing order, evidence, or timeout law.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { upgradeBootstrapRemoteTextures } from './BootstrapRemoteTextureUpgrade.js';

const DEFAULT_REMOTE_TIMEOUT_MS = 10000;

test('requests canonical remote materials with the bounded first-visit timeout', async () => {
	let requests = 0;
	let observedTimeout = null;
	const receipt = await upgradeBootstrapRemoteTextures({}, ['forest.bark'], {
		cachedTextureImage: () => null,
		loadRuntimeMaterial: async (definition, options) => {
			requests += 1;
			observedTimeout = options.timeoutMs;
			return { loaded: true, selectedUrl: definition.primaryUrl };
		}
	});
	assert.equal(requests, 1);
	assert.equal(observedTimeout, DEFAULT_REMOTE_TIMEOUT_MS);
	assert.equal(receipt.loaded, 1);
	assert.equal(receipt.policy, 'attempted');
});

test('loads independent district roles concurrently and preserves role order', async () => {
	let active = 0;
	let maximumActive = 0;
	const roles = ['forest.bark', 'forest.chaiOak', 'stone.fieldstone'];
	const receipt = await upgradeBootstrapRemoteTextures({}, roles, {
		cachedTextureImage: () => null,
		loadRuntimeMaterial: async definition => {
			active += 1;
			maximumActive = Math.max(maximumActive, active);
			await delay(10);
			active -= 1;
			return { loaded: false, error: 'test-offline', role: definition.role };
		}
	});
	assert.equal(maximumActive, roles.length);
	assert.deepEqual(receipt.records.map(record => record.role), roles);
	assert.equal(receipt.records.every(record => record.error === 'test-offline'), true);
});

test('honors an explicit remote timeout override', async () => {
	let observedTimeout = null;
	await upgradeBootstrapRemoteTextures({}, ['forest.bark'], {
		cachedTextureImage: () => null,
		loadRuntimeMaterial: async (definition, options) => {
			observedTimeout = options.timeoutMs;
			return { loaded: false, role: definition.role };
		},
		remoteTimeoutMs: 4321
	});
	assert.equal(observedTimeout, 4321);
});

test('allows explicit remote disablement', async () => {
	let requests = 0;
	const receipt = await upgradeBootstrapRemoteTextures({}, ['forest.bark'], {
		loadRuntimeMaterial: async () => { requests += 1; },
		remoteUpgrade: false
	});
	assert.equal(requests, 0);
	assert.equal(receipt.policy, 'disabled');
});

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
