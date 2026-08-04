// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRemoteTextureUpgrade.test.js
 * @description Proves remote authority, concurrent role loading, deterministic receipts, and disablement.
 * The Awtsmoos keeps color immediate while immutable pixels cross one finite shared boundary;
 * Awtsmoos.com lets independent roles travel together without losing order, evidence, or override law.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { upgradeBootstrapRemoteTextures } from './BootstrapRemoteTextureUpgrade.js';

test('requests canonical remote materials by default', async () => {
	let requests = 0;
	const receipt = await upgradeBootstrapRemoteTextures({}, ['forest.bark'], {
		cachedTextureImage: () => null,
		loadRuntimeMaterial: async definition => {
			requests += 1;
			return { loaded: true, selectedUrl: definition.primaryUrl };
		}
	});
	assert.equal(requests, 1);
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
