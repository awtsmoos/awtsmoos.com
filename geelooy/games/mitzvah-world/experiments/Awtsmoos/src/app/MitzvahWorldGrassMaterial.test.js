// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldGrassMaterial.test.js
 * @description Proves the bounded grass contract: the generated blade texture
 * has soft alpha edges (no square cards), exactly one shared material is
 * created with the correct policy, clusters are bounded, and one shared wind
 * uniform serves the whole field.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BLADE_FADE_METERS,
	BLADE_NEAR_METERS,
	GRASS_BLADE_TEXTURE_SIZE,
	MAX_GRASS_CLUSTERS,
	createSharedGrassMaterial,
	createSharedGrassWind,
	generateGrassBladeAlpha,
	packageGrassMaterialEvidence,
	planGrassClusters
} from './MitzvahWorldGrassMaterial.js';

test('blade texture has soft alpha edges, no hard square silhouette', () => {
	const image = generateGrassBladeAlpha(32);
	assert.equal(image.width, 32);
	assert.equal(image.height, 32);
	assert.equal(image.data.length, 32 * 32 * 4);
	const alphaAt = (x, y) => image.data[(y * 32 + x) * 4 + 3];
	// Bottom-center of the blade is opaque.
	assert.ok(alphaAt(16, 2) > 200, `root should be opaque, got ${alphaAt(16, 2)}`);
	// Far left/right edges are transparent (soft edge, not a square card).
	assert.equal(alphaAt(0, 8), 0);
	assert.equal(alphaAt(31, 8), 0);
	// The tip fades out.
	assert.ok(alphaAt(16, 31) < 40, `tip should fade, got ${alphaAt(16, 31)}`);
	// Mid-blade shows a gradient, not a binary mask.
	const row = [4, 8, 12, 16, 20, 24, 28].map(x => alphaAt(x, 16));
	assert.ok(row[0] < row[3] && row[6] < row[3], `expected soft falloff, got ${row}`);
	assert.ok(row[3] > 200, `blade core should be opaque, got ${row[3]}`);
	// Blade color matches the meadow grass tone (#5d9f42 family).
	const r = image.data[(16 * 32 + 16) * 4];
	const g = image.data[(16 * 32 + 16) * 4 + 1];
	const b = image.data[(16 * 32 + 16) * 4 + 2];
	assert.ok(g > r && g > b, `expected green-dominant, got ${r},${g},${b}`);
});

test('exactly one shared material is created with the bounded policy', () => {
	const calls = [];
	const image = generateGrassBladeAlpha();
	const material = createSharedGrassMaterial({
		createMaterial: (options) => {
			calls.push(options);
			return { fake: true, options };
		},
		image,
		quality: 'high'
	});
	assert.equal(calls.length, 1);
	const options = calls[0].options || calls[0];
	assert.equal(options.alphaMode, 'MASK');
	assert.equal(options.alphaToCoverage, true);
	assert.equal(options.transparent, false);
	assert.equal(options.depthWrite, true);
	assert.equal(options.anisotropy, 8);
	const policy = options.texturePolicy;
	assert.equal(policy.mipmaps, true);
	assert.equal(policy.minFilter, 'LinearMipmapLinear');
	assert.equal(policy.colorSpace, 'srgb');
	assert.deepEqual(policy.uvScale, [1, 1]);
	assert.equal(policy.castShadow, false);
	assert.equal(policy.receiveShadow, false);
	assert.equal(policy.wind.mode, 'shared-uniform');
	assert.ok(material.fake);
});

test('material factory requires image bytes', () => {
	assert.throws(() => createSharedGrassMaterial({ createMaterial: () => ({}) }), TypeError);
	assert.throws(() => createSharedGrassMaterial({ image: generateGrassBladeAlpha() }), TypeError);
});

test('clusters partition placements into bounded spatial groups', () => {
	const placements = [];
	for (let index = 0; index < 200; index += 1) {
		placements.push({ position: { x: (index % 40) * 4 - 80, y: 0, z: Math.floor(index / 40) * 4 - 8 } });
	}
	const clusters = planGrassClusters(placements, 8);
	assert.ok(clusters.length > 0 && clusters.length <= MAX_GRASS_CLUSTERS);
	const total = clusters.reduce((sum, cluster) => sum + cluster.tuftCount, 0);
	assert.equal(total, 200);
	const seen = new Set();
	for (const cluster of clusters) {
		for (const placementIndex of cluster.placementIndices) {
			assert.ok(!seen.has(placementIndex), 'each placement belongs to exactly one cluster');
			seen.add(placementIndex);
		}
		assert.ok(cluster.center.x >= cluster.bounds.minX && cluster.center.x <= cluster.bounds.maxX);
	}
});

test('one shared wind uniform updates once per frame', () => {
	const wind = createSharedGrassWind();
	const first = wind.update(1.5, { wakeStrength: 0.3, wakeX: 4, wakeZ: -2 });
	assert.equal(first.time, 1.5);
	assert.equal(first.wakeX, 4);
	assert.equal(first.wakeStrength, 0.3);
	const second = wind.update(1.6);
	assert.equal(second, first, 'the uniform object itself is shared');
	assert.equal(second.time, 1.6);
});

test('evidence proves the bounded contract', () => {
	const good = packageGrassMaterialEvidence({
		clusters: planGrassClusters([{ position: { x: 1, y: 0, z: 1 } }]),
		cullDistance: 210,
		fadeStart: 24,
		materialCount: 1,
		textureBytes: GRASS_BLADE_TEXTURE_SIZE * GRASS_BLADE_TEXTURE_SIZE * 4,
		tuftBudget: 450,
		tuftCount: 420
	});
	assert.equal(good.ok, true);
	const bad = packageGrassMaterialEvidence({
		clusters: [],
		cullDistance: 210,
		fadeStart: 24,
		materialCount: 2,
		textureBytes: 64 * 64 * 4,
		tuftBudget: 450,
		tuftCount: 420
	});
	assert.equal(bad.ok, false);
	assert.equal(bad.checks.singleMaterial, false);
	assert.ok(BLADE_NEAR_METERS < BLADE_FADE_METERS);
});
