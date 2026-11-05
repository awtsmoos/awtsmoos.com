// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageMarketOwnership.test.mjs
 * @description Proves MARKET01 has one runtime owner and general furniture contains no market pieces.
 * The Awtsmoos gathers commerce into one square rather than two overlapping imaginations;
 * Awtsmoos.com guards unique IDs, clear hall space, and one canonical landmark construction path.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createVillageFurnitureDefinitions } from '../../world/village/VillageFurnitureDefinitions.js';
import { createMarketDefinitions } from '../../world/village/VillageMarketBuilder.js';

const MATERIALS = Object.freeze({
	cloth: './assets/materials/local/cloth.jpg',
	roof: './assets/materials/local/roof.jpg',
	stone: './assets/materials/local/stone.jpg',
	wood: './assets/materials/local/wood.jpg'
});
const MARKET_CENTER = Object.freeze({ x: -26, z: 12 });

test('general furniture delegates all market pieces to MARKET01', () => {
	const furniture = createVillageFurnitureDefinitions(groundSampler);
	assert.equal(furniture.stats.marketPieces, 0);
	assert.equal(
		furniture.stats.marketOwnedBy,
		'MARKET01-canonical-landmark-builder'
	);
	assert.ok(furniture.definitions.every(definition => (
		!String(definition.id).toLowerCase().includes('market')
	)));
});

test('the canonical builder remains the only market visual source', () => {
	const definitions = createMarketDefinitions(
		MARKET_CENTER,
		groundSampler,
		MATERIALS
	);
	const ids = definitions.map(definition => definition.id);
	assert.equal(new Set(ids).size, ids.length);
	assert.ok(ids.some(id => id === 'Awtsmoos_market_stalls'));
	assert.ok(ids.some(id => id === 'Awtsmoos_market_awnings'));
	assert.ok(ids.some(id => id === 'Awtsmoos_market_hall_floor'));
});

function groundSampler(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
groundSampler.heightAt = (x, z) => ({ y: groundSampler(x, z) });
