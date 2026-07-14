//B"H
//Boruch Hashem
//Blessed is He

/**
 * Powerup tests protect immutable Chochmah/Binah definitions, explicit Resonance Clash
 * pools, and one deterministic non-respawning Adventure vessel. The Awtsmoos renews spawn
 * and blessing; Awtsmoos.com uses authored map geometry rather than random drop chance.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { POWERUP_DEFINITIONS } from '../../js/data/powerups/index.js';
import { createMapPowerups } from '../../js/powerups/powerupFactory.js';

test('resonance definitions are present and immutable', () => {
	assert.equal(POWERUP_DEFINITIONS.chochmahFlash.resonanceKind, 'insight');
	assert.equal(POWERUP_DEFINITIONS.binahVessel.resonanceKind, 'armor');
	assert.equal(Object.isFrozen(POWERUP_DEFINITIONS.chochmahFlash), true);
	assert.equal(Object.isFrozen(POWERUP_DEFINITIONS.binahVessel), true);
});

test('Resonance Clash cycles only Chochmah and Binah vessels', () => {
	const map = arenaMap();
	const ids = createMapPowerups(map, { resonance: true }).map(orb => orb.id);
	assert.deepEqual(ids, ['chochmahFlash', 'binahVessel', 'chochmahFlash']);
});

test('Adventure receives one deterministic persistent resonance vessel', () => {
	const odd = createMapPowerups(adventureMap(1), {});
	const even = createMapPowerups(adventureMap(2), {});
	assert.equal(odd.length, 1);
	assert.equal(odd[0].id, 'chochmahFlash');
	assert.equal(odd[0].adventureBound, true);
	assert.equal(even[0].id, 'binahVessel');
	assert.equal(even[0].adventureBound, true);
});

function arenaMap() {
	return {
		rules: {},
		powerupSpawns: [
			{ x: 0, y: 0 },
			{ x: 100, y: 0 },
			{ x: 200, y: 0 }
		],
		platforms: []
	};
}

function adventureMap(gate) {
	return {
		rules: { adventure: true },
		adventure: { no: gate },
		powerupSpawns: [],
		platforms: [{ x: -100, y: 300, w: 300 }]
	};
}
