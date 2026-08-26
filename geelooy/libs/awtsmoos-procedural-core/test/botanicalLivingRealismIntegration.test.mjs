// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file botanicalLivingRealismIntegration.test.mjs
 * @description Proves the public realistic generator now reveals the full living manifest without moving authoritative geometry or breaking legacy realism.
 * The Awtsmoos renews visible petal and hidden sap together; Awtsmoos.com asks these witnesses to prove deeper life can arrive without displacing one trusted point of yesterday's flower.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	generateBotanicalPlant
} from '../src/core/geometry/generators/botany/BotanicalGenerator.js';
import {
	generateRealisticBotanicalCluster,
	generateRealisticBotanicalPlant
} from '../src/core/geometry/generators/botany/BotanicalRealism.js';

const BASE_OPTIONS = Object.freeze({
	quality: 'low',
	seed: 927,
	species: 'daisy'
});

/** Extracts authoritative geometry-bearing fields for identity comparison. */
function geometryWitness(payload) {
	return {
		parts: payload.parts,
		quality: payload.quality,
		seed: payload.seed,
		speciesId: payload.speciesId,
		stats: payload.stats
	};
}

test('B"H | public realistic plant preserves authoritative base geometry exactly', () => {
	const base = generateBotanicalPlant(BASE_OPTIONS);
	const living = generateRealisticBotanicalPlant({
		...BASE_OPTIONS,
		growth: 0.7,
		season: 'autumn',
		wind: [2, 0.2, -0.5]
	});
	assert.deepEqual(geometryWitness(living), geometryWitness(base));
	assert.equal(living.realism.seasonalMaterial.chlorophyll, 0.42);
	assert.equal(living.realism.lods.length, 4);
	assert.ok(living.realism.windSkeleton.some(node => Math.hypot(...node.response) > 0));
});

test('B"H | public realistic plant exposes the complete living artifact graph', () => {
	const living = generateRealisticBotanicalPlant(BASE_OPTIONS);
	const artifacts = living.realismArtifacts;
	assert.equal(artifacts.schema, 'awtsmoos.botanical-realism-artifacts');
	assert.ok(artifacts.biomechanics.windModes.length >= 3);
	assert.ok(artifacts.physiology.photosynthesis > 0);
	assert.ok(artifacts.roots.segments.length > 0);
	assert.equal(artifacts.surfaces.length, living.parts.length);
	assert.equal(artifacts.vascular.organs.length, living.parts.length);
	assert.equal(artifacts.environment.sourceSpeciesId, living.speciesId);
	assert.ok(artifacts.capabilities.includes('environment-coupling'));
	assert.ok(artifacts.capabilities.includes('vascular-state'));
});

test('B"H | advanced living options flow to physiology, season, roots, and reproduction', () => {
	const living = generateRealisticBotanicalPlant({
		...BASE_OPTIONS,
		living: {
			physiology: { hydration: 0.24, light: 0.91 },
			reproduction: { pollenCount: 17 },
			roots: { maximumSegments: 48 },
			season: { phase: 0.72 },
			vascular: { initialWater: 0.31 }
		}
	});
	assert.equal(living.realismArtifacts.physiology.environment.hydration, 0.24);
	assert.equal(living.realismArtifacts.reproduction.pollen.length, 17);
	assert.equal(living.realismArtifacts.season.season, 'autumn');
	assert.equal(living.realismArtifacts.vascular.organs[0].hydration, 0.31);
	assert.ok(living.realismArtifacts.roots.segments.length <= 48);
});

test('B"H | realistic clusters receive additive living biology without changing cluster identity', () => {
	const options = { count: 4, quality: 'low', radius: 2, seed: 44, species: 'daisy' };
	const first = generateRealisticBotanicalCluster(options);
	const second = generateRealisticBotanicalCluster(options);
	assert.deepEqual(first, second);
	assert.equal(first.instances, 4);
	assert.equal(first.realismArtifacts.sourceSeed, first.seed);
	assert.equal(first.realismArtifacts.sourceSpeciesId, first.speciesId);
	assert.ok(first.realismArtifacts.reproduction.flowering);
});
