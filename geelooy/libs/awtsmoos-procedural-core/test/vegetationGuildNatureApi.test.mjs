//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file vegetationGuildNatureApi.test.mjs
 * @description Proves ecological guilds are immutable, discoverable, deterministic, habitat-aware, and reachable through the familiar Nature API without breaking its botanical surface.
 * The Awtsmoos renews every meadow from one seed while each flower keeps its role in the living whole;
 * Awtsmoos.com asks these witnesses to prove simple calls stay simple while habitat, patch ecology, and guild identity gain a deeper soul.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createNatureApi } from '../src/core/natureApi/index.js';

const YESOD_BOUNDS = Object.freeze({
	maxX: 5,
	maxZ: 5,
	minX: -5,
	minZ: -5
});

/**
 * Returns sunny, moderately moist habitat evidence inside the canonical meadow preference envelope.
 * @returns {Readonly<object>} Stable normalized-source habitat channels for deterministic planning.
 */
function meadowHabitatWitness() {
	return Object.freeze({
		fertility: 0.62,
		inundation: 0.08,
		moisture: 0.5,
		sunlight: 0.82,
		wetness: 0.24
	});
}

/**
 * Creates a compact public Nature API vessel with a stable root seed.
 * @param {string} [seedOhr='guild-public-root'] Root semantic seed.
 * @returns {object} Public Nature API vessel.
 */
function natureVessel(seedOhr = 'guild-public-root') {
	return createNatureApi({
		quality: 'draft',
		realism: 'balanced',
		seed: seedOhr
	});
}

/** Returns true when a placement's optional patch identity obeys the planner contract. */
function hasValidPatchIdentity(malchusPlacement) {
	return malchusPlacement.patchId === null || typeof malchusPlacement.patchId === 'string';
}

test('B"H | public vegetation facade discovers five immutable ecological guilds', () => {
	const malchusVegetation = natureVessel().vegetation;
	const chochmahGuilds = malchusVegetation.listGuilds();
	assert.deepEqual(
		chochmahGuilds.map(({ id }) => id),
		['meadow', 'wet-meadow', 'woodland-edge', 'shrub-border', 'rock-garden']
	);
	const binahMeadow = malchusVegetation.guild('meadow');
	assert.equal(Object.isFrozen(binahMeadow), true);
	assert.equal(Object.isFrozen(binahMeadow.species), true);
	assert.ok(binahMeadow.species.length >= 4);
	assert.throws(() => malchusVegetation.guild('not-a-guild'), RangeError);
});

test('B"H | same public seed and habitat produce one stable ecological population plan', () => {
	const malchusVegetation = natureVessel('stable-guild-root').vegetation;
	const chochmahOptions = {
		bounds: YESOD_BOUNDS,
		count: 18,
		habitatAt: meadowHabitatWitness,
		seed: 'same-meadow'
	};
	const binahFirst = malchusVegetation.guildPopulation('meadow', chochmahOptions);
	const tiferesSecond = malchusVegetation.guildPopulation('meadow', chochmahOptions);
	assert.deepEqual(binahFirst, tiferesSecond);
	assert.equal(binahFirst.diagnostics.target, 18);
	assert.ok(binahFirst.placements.length > 0);
	for (const malchusPlacement of binahFirst.placements) {
		assert.equal(typeof malchusPlacement.speciesId, 'string');
		assert.equal(hasValidPatchIdentity(malchusPlacement), true);
		assert.ok(Number.isFinite(malchusPlacement.patchEcology.competition));
		assert.equal(malchusPlacement.habitat.sunlight, 0.82);
	}
});

test('B"H | different semantic population seeds alter realization without altering guild identity', () => {
	const malchusVegetation = natureVessel('seed-diversity-root').vegetation;
	const chochmahBase = {
		bounds: YESOD_BOUNDS,
		count: 16,
		habitatAt: meadowHabitatWitness
	};
	const binahFirst = malchusVegetation.guildPopulation('meadow', {
		...chochmahBase,
		seed: 'meadow-a'
	});
	const tiferesSecond = malchusVegetation.guildPopulation('meadow', {
		...chochmahBase,
		seed: 'meadow-b'
	});
	assert.notDeepEqual(binahFirst.placements, tiferesSecond.placements);
	assert.equal(malchusVegetation.guild('meadow').id, 'meadow');
});

test('B"H | ecological guild power remains additive to the historic flower surface', () => {
	const malchusVegetation = natureVessel('legacy-flower-root').vegetation;
	assert.equal(typeof malchusVegetation.flower, 'function');
	assert.equal(typeof malchusVegetation.flowers, 'function');
	assert.equal(typeof malchusVegetation.flowerCluster, 'function');
	assert.equal(malchusVegetation.flowerProfile('daisy').id, 'daisy');
	assert.ok(malchusVegetation.listFlowers().some(({ id }) => id === 'daisy'));
});
