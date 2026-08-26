// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file botanicalClusterPhenology.test.mjs
 * @description Proves specimen phenology consumes authoritative frozen patch evidence without moving geometry or spending another random stream.
 * The Awtsmoos renews every blossom, edge, season, and hidden nectar before the meadow receives one collective witness;
 * Awtsmoos.com asks these tests to prove that ecology can deepen the living garden while yesterday's constellation remains fixed forever.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	generateBotanicalCluster,
	planBotanicalCluster
} from '../src/core/geometry/generators/botany/BotanicalGenerator.js';
import { generateRealisticBotanicalCluster } from '../src/core/geometry/generators/botany/BotanicalRealism.js';

const CLUSTER_OPTIONS = Object.freeze({
	count: 6,
	distribution: 'natural',
	quality: 'low',
	radius: 3,
	seed: 771,
	species: 'daisy'
});

/** Returns only geometry-bearing cluster fields so derived biology can vary independently. */
function geometryWitness(cluster) {
	return {
		instances: cluster.instances,
		parts: cluster.parts,
		placements: cluster.placements,
		seed: cluster.seed,
		stats: cluster.stats
	};
}

test('B"H | generated clusters expose deterministic frozen patch placements', () => {
	const plan = planBotanicalCluster(CLUSTER_OPTIONS);
	const cluster = generateBotanicalCluster(CLUSTER_OPTIONS);
	assert.deepEqual(cluster.placements, plan.placements);
	assert.notEqual(cluster.placements, plan.placements);
	assert.equal(Object.isFrozen(cluster.placements), true);
	assert.ok(cluster.placements.every(placement => Object.isFrozen(placement)));
});

test('B"H | realistic clusters derive one phenology specimen from every authoritative placement', () => {
	const cluster = generateRealisticBotanicalCluster({ ...CLUSTER_OPTIONS, season: 'spring' });
	const phenology = cluster.realismArtifacts.clusterPhenology;
	assert.equal(phenology.specimens.length, cluster.instances);
	assert.equal(phenology.summary.count, cluster.instances);
	assert.ok(cluster.realismArtifacts.capabilities.includes('cluster-phenology'));
	for (let index = 0; index < cluster.instances; index += 1) {
		assert.equal(phenology.specimens[index].id, cluster.placements[index].id);
		assert.equal(phenology.specimens[index].position, cluster.placements[index].position);
		assert.equal(phenology.specimens[index].seed, cluster.placements[index].seed);
	}
});

test('B"H | season changes flowering without moving cluster geometry', () => {
	const spring = generateRealisticBotanicalCluster({ ...CLUSTER_OPTIONS, season: 'spring' });
	const winter = generateRealisticBotanicalCluster({ ...CLUSTER_OPTIONS, season: 'winter' });
	assert.deepEqual(geometryWitness(spring), geometryWitness(winter));
	assert.ok(spring.realismArtifacts.clusterPhenology.summary.meanFlowering
		> winter.realismArtifacts.clusterPhenology.summary.meanFlowering);
});

test('B"H | habitat stress changes phenology without perturbing placement identity', () => {
	const strong = generateRealisticBotanicalCluster({
		...CLUSTER_OPTIONS,
		environmentScore: () => 1,
		season: 'spring'
	});
	const stressed = generateRealisticBotanicalCluster({
		...CLUSTER_OPTIONS,
		environmentScore: () => 0.2,
		season: 'spring'
	});
	assert.deepEqual(
		strong.placements.map(({ environmentScore, ...placement }) => placement),
		stressed.placements.map(({ environmentScore, ...placement }) => placement)
	);
	assert.ok(stressed.realismArtifacts.clusterPhenology.summary.meanStress
		> strong.realismArtifacts.clusterPhenology.summary.meanStress);
	assert.ok(stressed.realismArtifacts.clusterPhenology.summary.meanFlowering
		< strong.realismArtifacts.clusterPhenology.summary.meanFlowering);
});

test('B"H | identical cluster inputs produce identical living phenology', () => {
	const first = generateRealisticBotanicalCluster({ ...CLUSTER_OPTIONS, season: 'spring' });
	const second = generateRealisticBotanicalCluster({ ...CLUSTER_OPTIONS, season: 'spring' });
	assert.deepEqual(first, second);
	assert.equal(Object.isFrozen(first.realismArtifacts.clusterPhenology), true);
	assert.equal(Object.isFrozen(first.realismArtifacts.clusterPhenology.specimens), true);
});
