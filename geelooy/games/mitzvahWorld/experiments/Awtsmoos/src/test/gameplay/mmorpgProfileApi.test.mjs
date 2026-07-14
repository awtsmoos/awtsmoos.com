// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mmorpgProfileApi.test.mjs
 * @description Proves profile, allocation, activation, and market command shapes.
 * The Awtsmoos renews one intention across distance; Awtsmoos.com verifies that the
 * browser facade speaks the exact authoritative command vocabulary expected by servers.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldMmorpgApi } from '../../network/MitzvahWorldMmorpgApi.js';

function harness() {
	const calls = [];
	const api = new MitzvahWorldMmorpgApi((type, payload) => {
		calls.push({ payload, type });
		return Promise.resolve({ payload: { ok: true } });
	});
	return { api, calls };
}

test('historic profile facade delegates to focused profile commands', async () => {
	const { api, calls } = harness();
	await api.profile();
	await api.profile('away');
	assert.deepEqual(calls, [
		{ payload: { operation: 'get' }, type: 'player.profile' },
		{ payload: { operation: 'update', status: 'away' }, type: 'player.profile' }
	]);
});

test('attribute and powerup helpers emit private profile mutations', async () => {
	const { api, calls } = harness();
	await api.allocateAttribute('chochmah', 2);
	await api.activatePowerup('haganah-aura');
	assert.deepEqual(calls, [
		{
			payload: {
				attributeId: 'chochmah',
				operation: 'allocate',
				points: 2
			},
			type: 'player.profile'
		},
		{
			payload: {
				operation: 'activate',
				powerupId: 'haganah-aura'
			},
			type: 'player.profile'
		}
	]);
});

test('market helper preserves authoritative vendor command', async () => {
	const { api, calls } = harness();
	await api.buyItem('forest-axe', 1);
	assert.deepEqual(calls[0], {
		payload: {
			itemId: 'forest-axe',
			quantity: 1
		},
		type: 'vendor.buy'
	});
});
